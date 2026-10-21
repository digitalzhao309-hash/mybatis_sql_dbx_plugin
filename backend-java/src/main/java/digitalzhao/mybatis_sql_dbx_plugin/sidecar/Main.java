package digitalzhao.mybatis_sql_dbx_plugin.sidecar;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import digitalzhao.mybatis_sql_dbx_plugin.Dialect;
import digitalzhao.mybatis_sql_dbx_plugin.ParamParser;
import digitalzhao.mybatis_sql_dbx_plugin.SqlGenerator;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * DBX 插件 sidecar 入口：stdio JSONL JSON-RPC（Sidecar Protocol v1）。
 * <ul>
 *   <li>stdout 只输出协议消息，日志一律写 stderr（[mybatis_sql_dbx_backend] 前缀）</li>
 *   <li>响应复用请求 id；无 method 或无 id 的消息（通知）直接忽略</li>
 *   <li>plugin/initialize 返回 {protocolVersion, capabilities, plugin:{id,version}}，
 *       其中 capabilities 必须是字符串数组（宿主按 Vec<String> 解码），
 *       id/version 必须与 manifest.json 一致</li>
 * </ul>
 */
public final class Main {

    /** 必须与 manifest.json 的 id / version 完全一致 */
    private static final String PLUGIN_ID = "digitalzhao.mybatis_sql_dbx_plugin";
    private static final String PLUGIN_VERSION = "0.1.1";
    private static final String LOG_PREFIX = "[mybatis_sql_dbx_backend] ";

    private static final int CODE_PARSE_ERROR = -32700;
    private static final int CODE_INVALID_PARAMS = -32602;
    private static final int CODE_METHOD_NOT_FOUND = -32601;
    private static final int CODE_INTERNAL_ERROR = -32603;

    private static final ObjectMapper MAPPER = new ObjectMapper();

    /** 业务错误：携带 JSON-RPC 错误码 */
    private static final class RpcException extends RuntimeException {
        private static final long serialVersionUID = 1L;
        final int code;

        RpcException(int code, String message) {
            super(message);
            this.code = code;
        }
    }

    public static void main(String[] args) {
        BufferedReader in = new BufferedReader(
                new InputStreamReader(System.in, StandardCharsets.UTF_8));
        final BufferedWriter out = new BufferedWriter(
                new OutputStreamWriter(System.out, StandardCharsets.UTF_8));
        try {
            String line;
            while ((line = in.readLine()) != null) {
                if (line.charAt(0) == '\uFEFF') {
                    // 容错：部分管道写入方会在流首附带 UTF-8 BOM 前导码
                    line = line.substring(1);
                }
                if (line.trim().isEmpty()) {
                    continue;
                }
                handleLine(line, out);
            }
        } catch (IOException e) {
            log("stdin closed: " + e.getMessage());
        } finally {
            try {
                out.flush();
            } catch (IOException ignore) {
                // 宿主已断开时忽略
            }
        }
    }

    /** 处理一行 JSON-RPC 请求并写回响应 */
    private static void handleLine(String line, BufferedWriter out) {
        JsonNode req;
        try {
            req = MAPPER.readTree(line);
        } catch (Exception e) {
            log("unparsable line ignored: " + e.getMessage());
            return;
        }
        if (req == null || !req.isObject()) {
            return;
        }
        JsonNode idNode = req.get("id");
        String method = req.path("method").asText(null);
        if (method == null || method.isEmpty() || idNode == null || idNode.isNull()) {
            return; // 通知或非请求消息：不响应
        }
        ObjectNode resp = MAPPER.createObjectNode();
        resp.put("jsonrpc", "2.0");
        resp.set("id", idNode);
        try {
            JsonNode result = dispatch(method, req.get("params"));
            resp.set("result", result == null ? MAPPER.createObjectNode() : result);
        } catch (RpcException e) {
            resp.set("error", errorNode(e.code, e.getMessage()));
        } catch (IllegalArgumentException e) {
            resp.set("error", errorNode(CODE_INVALID_PARAMS, rootMessage(e)));
        } catch (Throwable t) {
            resp.set("error", errorNode(CODE_INTERNAL_ERROR, rootMessage(t)));
            log("internal error on " + method + ": " + t);
        }
        try {
            out.write(MAPPER.writeValueAsString(resp));
            out.write("\n");
            out.flush();
        } catch (IOException e) {
            log("stdout write error: " + e.getMessage());
        }
    }

    private static JsonNode dispatch(String method, JsonNode params) {
        Map<String, JsonNode> p = toParamMap(params);
        if ("plugin/initialize".equals(method)) {
            return initialize(p);
        }
        if ("sql/listStatements".equals(method)) {
            return listStatements(p);
        }
        if ("sql/render".equals(method)) {
            return render(p);
        }
        throw new RpcException(CODE_METHOD_NOT_FOUND, "method not found: " + method);
    }

    /** Sidecar Protocol v1 握手 */
    private static JsonNode initialize(Map<String, JsonNode> params) {
        JsonNode host = params.get("host");
        if (host != null && host.has("protocolVersions") && host.get("protocolVersions").isArray()) {
            List<String> versions = new ArrayList<String>();
            for (JsonNode v : host.get("protocolVersions")) {
                versions.add(v.asText());
            }
            if (!versions.contains("1")) {
                log("warning: host does not declare protocol v1, supports: " + versions);
            }
        }
        ObjectNode result = MAPPER.createObjectNode();
        result.put("protocolVersion", 1);
        // 宿主 PluginHandshake.capabilities 为 Vec<String>：必须是数组，对象会报
        // "invalid type: map, expected a sequence" 导致激活失败
        result.set("capabilities", MAPPER.createArrayNode());
        ObjectNode plugin = result.putObject("plugin");
        plugin.put("id", PLUGIN_ID);
        plugin.put("version", PLUGIN_VERSION);
        return result;
    }

    /**
     * sql/listStatements：{mapperText, dialect} → {statements: [{id, type}]}
     * 输入 mapper 变化时由 UI 防抖后重新调用，无状态、每次新建引擎。
     */
    private static JsonNode listStatements(Map<String, JsonNode> params) {
        String mapperText = requireText(params, "mapperText");
        Dialect dialect = Dialect.of(textOr(params, "dialect", null));
        SqlGenerator gen = new SqlGenerator(
                Collections.singletonMap("PASTED", mapperText), dialect.databaseId());
        ArrayNode arr = MAPPER.createArrayNode();
        for (SqlGenerator.StatementInfo info : gen.listStatementInfos()) {
            ObjectNode o = arr.addObject();
            o.put("id", info.id);
            o.put("type", info.type);
        }
        ObjectNode result = MAPPER.createObjectNode();
        result.set("statements", arr);
        if (arr.isEmpty()) {
            JsonNode hint = detectDatabaseIdHint(mapperText, dialect.databaseId());
            if (hint != null) {
                result.set("hint", hint);
            }
        }
        return result;
    }

    /**
     * statements 为空时检查：XML 声明的 databaseId 与当前方言不一致。
     * MyBatis 对 databaseId 不匹配的 statement 同样静默跳过（列表为空无解释），
     * 这里返回结构化提示让前端引导用户切换方言。
     */
    private static JsonNode detectDatabaseIdHint(String mapperText, String currentDbId) {
        java.util.regex.Matcher m = java.util.regex.Pattern.compile(
                "databaseId\\s*=\\s*['\"]([^'\"]+)['\"]").matcher(mapperText);
        java.util.Set<String> declared = new java.util.LinkedHashSet<String>();
        while (m.find()) {
            declared.add(m.group(1));
        }
        if (declared.isEmpty() || declared.contains(currentDbId)) {
            return null;
        }
        ObjectNode hint = MAPPER.createObjectNode();
        ArrayNode ids = MAPPER.createArrayNode();
        for (String s : declared) {
            ids.add(s);
        }
        hint.set("declared", ids);
        hint.put("current", currentDbId);
        return hint;
    }

    /**
     * sql/render：{mapperText, statementId, paramsText, dialect} → {sql, warnings}
     * paramsText 支持 JSON 或 GET 请求参数样式（ParamParser 解析）。
     */
    private static JsonNode render(Map<String, JsonNode> params) {
        String mapperText = requireText(params, "mapperText");
        String statementId = requireText(params, "statementId");
        String paramsText = textOr(params, "paramsText", "");
        Dialect dialect = Dialect.of(textOr(params, "dialect", null));
        Object parsed = ParamParser.parse(paramsText);
        SqlGenerator gen = new SqlGenerator(
                Collections.singletonMap("PASTED", mapperText), dialect.databaseId());
        SqlGenerator.RenderResult r = gen.render(statementId, parsed, dialect);
        ObjectNode result = MAPPER.createObjectNode();
        result.put("sql", r.sql);
        ArrayNode warns = MAPPER.createArrayNode();
        for (String w : r.warnings) {
            warns.add(w);
        }
        result.set("warnings", warns);
        return result;
    }

    // ------------------------------------------------------------------

    private static ObjectNode errorNode(int code, String message) {
        ObjectNode err = MAPPER.createObjectNode();
        err.put("code", code);
        err.put("message", message == null || message.isEmpty() ? "error" : message);
        return err;
    }

    private static Map<String, JsonNode> toParamMap(JsonNode params) {
        Map<String, JsonNode> map = new HashMap<String, JsonNode>();
        if (params != null && params.isObject()) {
            Iterator<Map.Entry<String, JsonNode>> it = params.fields();
            while (it.hasNext()) {
                Map.Entry<String, JsonNode> e = it.next();
                map.put(e.getKey(), e.getValue());
            }
        }
        return map;
    }

    private static String requireText(Map<String, JsonNode> params, String key) {
        JsonNode v = params.get(key);
        if (v == null || !v.isTextual() || v.asText().trim().isEmpty()) {
            throw new RpcException(CODE_INVALID_PARAMS, "missing required param: " + key);
        }
        return v.asText();
    }

    private static String textOr(Map<String, JsonNode> params, String key, String def) {
        JsonNode v = params.get(key);
        if (v == null || v.isNull() || !v.isTextual()) {
            return def;
        }
        return v.asText();
    }

    private static String rootMessage(Throwable t) {
        Throwable cur = t;
        while (cur.getCause() != null && cur.getCause() != cur) {
            cur = cur.getCause();
        }
        String m = cur.getMessage();
        return m == null || m.isEmpty() ? cur.toString() : m;
    }

    private static void log(String msg) {
        System.err.println(LOG_PREFIX + msg);
    }
}
