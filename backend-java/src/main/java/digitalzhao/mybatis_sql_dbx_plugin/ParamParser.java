package digitalzhao.mybatis_sql_dbx_plugin;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.net.URLDecoder;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 入参解析：支持两种写法
 * <ol>
 *   <li>{"No":"O001","userId":"U001"} —— JSON 对象 / 数组（最常用）</li>
 *   <li>type=1&name=&beginDate=2026-01-01&endDate=2026-01-31&...
 *       —— GET 请求参数样式（k=v&k=v），支持直接粘贴完整请求 URL（自动截取 ? 之后部分）</li>
 * </ol>
 */
public final class ParamParser {

    private ParamParser() {
    }

    public static Object parse(String spec) {
        String s = spec == null ? null : spec.trim();
        if (s == null || s.isEmpty()) {
            return null;
        }
        if (s.startsWith("{") || s.startsWith("[")) {
            try {
                return new ObjectMapper().readValue(s, Object.class);
            } catch (Exception e) {
                throw new IllegalArgumentException("JSON 解析失败: " + e.getMessage());
            }
        }
        if (s.contains("=")) {
            return parseQueryString(s);
        }
        throw new IllegalArgumentException(
                "入参支持 JSON（{...} / [...]）或 GET 请求参数样式（k=v&k=v）: " + s);
    }

    /**
     * GET 请求参数样式解析：k=v&k=v
     * <ul>
     *   <li>支持粘贴完整 URL：自动截取最后一个 ? 之后的内容</li>
     *   <li>键、值均做 URL 解码（UTF-8：%XX 与 + → 空格）；解码失败保留原文</li>
     *   <li>值类型推断：空 → ""（配合 if test="xxx != ''"）；true/false → Boolean；
     *       整数 → Long；小数 → BigDecimal；其余 → 字符串
     *       （日期样式字符串保持 String，由 ValueFormatter 按方言生成 TO_DATE/TO_TIMESTAMP）</li>
     * </ul>
     */
    static Map<String, Object> parseQueryString(String text) {
        String t = text.trim();
        int q = t.lastIndexOf('?');
        if (q >= 0) {
            t = t.substring(q + 1).trim();
        }
        Map<String, Object> result = new LinkedHashMap<String, Object>();
        String[] segments = t.split("&");
        for (String seg : segments) {
            String p = seg.trim();
            if (p.isEmpty()) {
                continue; // 兼容末尾多一个 &
            }
            int eq = p.indexOf('='); // 只按第一个 = 切分，值里可含 =（如 base64）
            if (eq <= 0) {
                throw new IllegalArgumentException("GET 参数格式错误（应为 k=v，& 分隔）: " + p);
            }
            String key = decode(p.substring(0, eq).trim());
            String raw = p.substring(eq + 1).trim();
            result.put(key, inferValue(decode(raw)));
        }
        return result;
    }

    /** URL 解码（+ → 空格）；非法 % 序列时保留原文，避免整体解析失败 */
    private static String decode(String s) {
        try {
            return URLDecoder.decode(s, "UTF-8");
        } catch (Exception e) {
            return s;
        }
    }

    /** GET 值的类型推断（GET 传参本身全是字符串） */
    static Object inferValue(String raw) {
        String v = raw == null ? null : raw.trim();
        if (v == null) {
            return null;
        }
        if (v.isEmpty()) {
            return v; // 空值保持 ""，配合 mapper 中 if test="xxx != null and xxx != ''"
        }
        // 成对引号包裹 → 强制字符串（如编号含前导 0："007"）
        if (v.length() >= 2
                && ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith("\"") && v.endsWith("\"")))) {
            return v.substring(1, v.length() - 1);
        }
        if ("null".equalsIgnoreCase(v)) {
            return null;
        }
        if ("true".equalsIgnoreCase(v) || "false".equalsIgnoreCase(v)) {
            return Boolean.valueOf(v);
        }
        if (v.matches("-?\\d+")) {
            try {
                return Long.valueOf(v);
            } catch (NumberFormatException e) {
                return new BigDecimal(v);
            }
        }
        if (v.matches("-?\\d*\\.\\d+")) {
            return new BigDecimal(v);
        }
        return v;
    }
}
