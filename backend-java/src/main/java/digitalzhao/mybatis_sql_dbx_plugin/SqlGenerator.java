package digitalzhao.mybatis_sql_dbx_plugin;

import org.apache.ibatis.builder.xml.XMLMapperBuilder;
import org.apache.ibatis.mapping.BoundSql;
import org.apache.ibatis.mapping.MappedStatement;
import org.apache.ibatis.mapping.ParameterMapping;
import org.apache.ibatis.reflection.MetaObject;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.StringReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;

/**
 * 核心 SQL 生成器：借助 MyBatis 官方引擎解析 mapper XML 的动态标签
 * （if / where / foreach / set / choose / trim / include / bind / databaseId 等），
 * 得到带 ? 占位符的 BoundSql 后，按参数顺序把 ? 替换为方言化的 SQL 字面量。
 * mapper 来源既可以是文件（粘贴文件路径），也可以是字符串（GUI/插件粘贴内容）。
 */
public class SqlGenerator {

    private final org.apache.ibatis.session.Configuration configuration =
            new org.apache.ibatis.session.Configuration();

    /** mapper XML 中可能引用实体类全限定名的属性，解析前预注册缺失类为 Object 别名，避免类型不在 classpath 时解析失败 */
    private static final String[] CLASS_NAME_ATTRS = {"type", "javaType", "ofType", "resultType", "parameterType"};

    /** 各 mapper 的 statement 全限定 id，按 XML 文档顺序（MyBatis Configuration 内部为 HashMap，无序，需自行记录） */
    private final List<String> statementOrder = new ArrayList<String>();

    /** 字符串模式：key 为 mapper 名称（用于报错定位），value 为 XML 全文 */
    public SqlGenerator(Map<String, String> mapperXmls, String databaseId) {
        try {
            configuration.setDatabaseId(databaseId);
            for (Map.Entry<String, String> e : mapperXmls.entrySet()) {
                String xml = normalizeMapperXml(e.getValue());
                xml = stripUnresolvedRefs(xml);
                registerMissingAliases(xml);
                recordStatementOrder(xml);
                XMLMapperBuilder parser = new XMLMapperBuilder(
                        new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)),
                        configuration, e.getKey(), configuration.getSqlFragments());
                parser.parse();
            }
        } catch (Exception ex) {
            throw new IllegalArgumentException("解析 mapper 失败: " + rootMessage(ex));
        }
    }

    /** 读文件：优先 UTF-8，出现非法序列（U+FFFD）时按 GBK 重试；去除 UTF-8 BOM */
    public static String readText(File f) throws java.io.IOException {
        byte[] bytes = Files.readAllBytes(f.toPath());
        String s = new String(bytes, StandardCharsets.UTF_8);
        if (s.indexOf('\uFEFF') == 0) {
            s = s.substring(1);
        }
        if (s.indexOf('\uFFFD') >= 0) {
            try {
                String gbk = new String(bytes, "GBK");
                if (gbk.indexOf('\uFFFD') < 0) {
                    s = gbk;
                }
            } catch (Exception ignore) {
                // GBK 解码失败时保留 UTF-8 结果
            }
        }
        return s;
    }

    /** 列出全部 statement（id + SQL 类型），按 XML 声明顺序 */
    public List<String> listStatements() {
        List<String> result = new ArrayList<String>();
        for (String n : listStatementIds()) {
            MappedStatement ms = configuration.getMappedStatement(n);
            result.add(n + "    [" + ms.getSqlCommandType() + "]");
        }
        return result;
    }

    /**
     * 仅列出全限定的 statement id，保持 mapper XML 中的声明顺序。
     * MyBatis 的 StrictMap 会额外存一份无命名空间前缀的短名，需过滤；
     * 未在文档顺序中记录到的已注册 statement（理论少见）按字典序补在末尾兜底。
     */
    public List<String> listStatementIds() {
        List<String> ids = new ArrayList<String>();
        java.util.Collection<String> registered = configuration.getMappedStatementNames();
        for (String n : statementOrder) {
            if (n.contains(".") && registered.contains(n)) { // 完整 id 恒为 namespace.id（至少含一个点），短名不含点
                ids.add(n);
            }
        }
        TreeSet<String> rest = new TreeSet<String>();
        for (String n : registered) {
            if (n.contains(".") && !ids.contains(n)) {
                rest.add(n);
            }
        }
        ids.addAll(rest);
        return ids;
    }

    /** 列出全部 statement 元信息（id + SQL 类型），按 XML 声明顺序，供 sidecar 结构化返回 */
    public List<StatementInfo> listStatementInfos() {
        List<StatementInfo> result = new ArrayList<StatementInfo>();
        for (String n : listStatementIds()) {
            result.add(new StatementInfo(n,
                    configuration.getMappedStatement(n).getSqlCommandType().name()));
        }
        return result;
    }

    public RenderResult render(String statementId, Object params, Dialect dialect) {
        MappedStatement ms = resolveStatement(statementId);
        BoundSql boundSql;
        try {
            boundSql = ms.getBoundSql(params);
        } catch (Exception e) {
            throw new IllegalArgumentException(
                    "渲染 statement 失败: " + statementId + "，原因: " + rootMessage(e));
        }
        RenderResult r = new RenderResult();
        r.sql = replaceQuestionMarks(boundSql.getSql(), boundSql, params, dialect, r.warnings);
        return r;
    }

    // ------------------------------------------------------------------

    private MappedStatement resolveStatement(String id) {
        try {
            return configuration.getMappedStatement(id);
        } catch (Exception e) {
            List<String> hits = new ArrayList<String>();
            for (String n : configuration.getMappedStatementNames()) {
                if (n.equals(id) || n.endsWith("." + id)) {
                    hits.add(n);
                }
            }
            if (hits.size() == 1) {
                return configuration.getMappedStatement(hits.get(0));
            }
            if (hits.isEmpty()) {
                throw new IllegalArgumentException("未找到 statement: " + id);
            }
            throw new IllegalArgumentException("statement id 不唯一: " + id + " → " + hits);
        }
    }

    /**
     * 把 BoundSql 中的 ? 依次替换为格式化值。
     * 引号内的 ? 视为字面量跳过；参数个数不足时保留 ? 并告警。
     */
    private String replaceQuestionMarks(String sql, BoundSql boundSql, Object params,
                                        Dialect dialect, List<String> warnings) {
        List<ParameterMapping> mappings = boundSql.getParameterMappings();
        StringBuilder out = new StringBuilder(sql.length() + 128);
        boolean inQuote = false;
        int paramIdx = 0;
        int n = sql.length();
        for (int i = 0; i < n; i++) {
            char c = sql.charAt(i);
            if (c == '\'') {
                inQuote = !inQuote; // '' 转义：两次切换后状态复原
                out.append(c);
                continue;
            }
            if (c == '?' && !inQuote) {
                if (paramIdx < mappings.size()) {
                    Object value = resolveValue(boundSql, mappings.get(paramIdx), params, warnings);
                    out.append(ValueFormatter.format(value, dialect));
                    paramIdx++;
                } else {
                    out.append(c); // SQL 自身的 ? 字面量
                }
            } else {
                out.append(c);
            }
        }
        if (paramIdx < mappings.size()) {
            warnings.add("有 " + (mappings.size() - paramIdx) + " 个参数未消费（模板与参数不匹配？）");
        }
        return out.toString();
    }

    /** 模拟 DefaultParameterHandler 的取值顺序：additionalParameter → Map → 单值 → MetaObject 嵌套属性 */
    private Object resolveValue(BoundSql boundSql, ParameterMapping pm, Object params, List<String> warnings) {
        String prop = pm.getProperty();
        if (boundSql.hasAdditionalParameter(prop)) {
            return boundSql.getAdditionalParameter(prop);
        }
        if (params instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) params;
            if (map.containsKey(prop)) {
                return map.get(prop);
            }
            if (prop.indexOf('.') >= 0) {
                // 嵌套属性（如 #{user.name}）：Map 内的子 Map 逐级取值
                try {
                    MetaObject mo = configuration.newMetaObject(params);
                    Object v = mo.getValue(prop);
                    if (v != null) {
                        return v;
                    }
                } catch (Exception ignore) {
                    // 继续按缺失处理
                }
            }
            warnings.add("未提供参数 [" + prop + "]，已用 NULL 替代");
            return null;
        }
        if (params == null) {
            warnings.add("未提供任何参数，属性 [" + prop + "] 已用 NULL 替代");
            return null;
        }
        // 集合/单值参数（JSON 数组等）：MyBatis 对基础类型参数 #{任意名} 均取整个对象
        if (configuration.getTypeHandlerRegistry().hasTypeHandler(params.getClass())) {
            return params;
        }
        try {
            MetaObject mo = configuration.newMetaObject(params);
            return mo.getValue(prop);
        } catch (Exception e) {
            warnings.add("参数对象上未找到属性 [" + prop + "]，已用 NULL 替代");
            return null;
        }
    }

    /**
     * 预处理：移除 statement 上引用但未定义的 resultMap / parameterMap 属性。
     * MyBatis 对缺失引用抛 IncompleteElementException 并把 statement 搁置在待定队列中
     * 静默丢弃，表现为"statement 列表为空、无法转化"；而结果/参数映射不影响 SQL 文本
     * 生成，去掉即可恢复可渲染性。粘贴的 mapper 片段往往只带单条 statement、
     * 缺少配套的 resultMap 定义，这是最常见的一类"无法转化"。
     */
    static String stripUnresolvedRefs(String xml) {
        try {
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            dbf.setValidating(false);
            dbf.setExpandEntityReferences(false);
            try {
                dbf.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
            } catch (Exception ignore) {
                // 解析器不支持该 feature 时忽略
            }
            DocumentBuilder db = dbf.newDocumentBuilder();
            Document doc = db.parse(new InputSource(new StringReader(xml)));
            String namespace = doc.getDocumentElement().getAttribute("namespace");
            TreeSet<String> defined = new TreeSet<String>();
            collectIds(doc.getElementsByTagName("resultMap"), defined);
            collectIds(doc.getElementsByTagName("parameterMap"), defined);
            if (namespace != null && !namespace.isEmpty()) {
                TreeSet<String> qualified = new TreeSet<String>();
                for (String id : defined) {
                    qualified.add(namespace + "." + id);
                }
                defined.addAll(qualified);
            }
            boolean changed = false;
            NodeList all = doc.getElementsByTagName("*");
            for (int i = 0; i < all.getLength(); i++) {
                Element el = (Element) all.item(i);
                String tag = el.getTagName();
                if (!"select".equals(tag) && !"insert".equals(tag)
                        && !"update".equals(tag) && !"delete".equals(tag)) {
                    continue;
                }
                String[] attrs = {"resultMap", "parameterMap"};
                for (String attr : attrs) {
                    String ref = el.getAttribute(attr);
                    if (ref != null && !ref.isEmpty() && !defined.contains(ref)) {
                        el.removeAttribute(attr);
                        changed = true;
                    }
                }
            }
            if (!changed) {
                return xml;
            }
            javax.xml.transform.Transformer t = javax.xml.transform.TransformerFactory.newInstance().newTransformer();
            t.setOutputProperty(javax.xml.transform.OutputKeys.OMIT_XML_DECLARATION, "yes");
            // Transformer 序列化会丢 DOCTYPE，重新补上（MyBatis 的 InputStream 构造器强制要求）
            t.setOutputProperty(javax.xml.transform.OutputKeys.DOCTYPE_PUBLIC,
                    "-//mybatis.org//DTD Mapper 3.0//EN");
            t.setOutputProperty(javax.xml.transform.OutputKeys.DOCTYPE_SYSTEM,
                    "http://mybatis.org/dtd/mybatis-3-mapper.dtd");
            java.io.StringWriter sw = new java.io.StringWriter();
            t.transform(new javax.xml.transform.dom.DOMSource(doc),
                    new javax.xml.transform.stream.StreamResult(sw));
            return sw.toString();
        } catch (Exception e) {
            return xml; // 预处理失败不阻断原解析流程
        }
    }

    private static void collectIds(NodeList nodes, TreeSet<String> out) {
        for (int i = 0; i < nodes.getLength(); i++) {
            String id = ((Element) nodes.item(i)).getAttribute("id");
            if (id != null && !id.isEmpty()) {
                out.add(id);
            }
        }
    }

    /** 按文档顺序收集 mapper 里的 statement 全限定 id（namespace.id），跨 mapper 依序追加；失败不阻断解析 */
    private void recordStatementOrder(String xml) {
        try {
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            dbf.setValidating(false);
            dbf.setExpandEntityReferences(false);
            try {
                dbf.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
            } catch (Exception ignore) {
                // 解析器不支持该 feature 时忽略
            }
            DocumentBuilder db = dbf.newDocumentBuilder();
            Document doc = db.parse(new InputSource(new StringReader(xml)));
            String namespace = doc.getDocumentElement().getAttribute("namespace");
            NodeList all = doc.getElementsByTagName("*"); // getElementsByTagName 按文档顺序返回
            for (int i = 0; i < all.getLength(); i++) {
                Element el = (Element) all.item(i);
                String tag = el.getTagName();
                if (!"select".equals(tag) && !"insert".equals(tag)
                        && !"update".equals(tag) && !"delete".equals(tag)) {
                    continue;
                }
                String id = el.getAttribute("id");
                if (id == null || id.isEmpty()) {
                    continue;
                }
                String full = (namespace != null && !namespace.isEmpty() && id.indexOf('.') < 0)
                        ? namespace + "." + id : id;
                if (!statementOrder.contains(full)) {
                    statementOrder.add(full);
                }
            }
        } catch (Exception ignore) {
            // 记录失败时 listStatementIds 退回字典序兜底，不影响渲染
        }
    }

    private void registerMissingAliases(String xml) throws Exception {
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        dbf.setValidating(false);
        dbf.setExpandEntityReferences(false);
        try {
            dbf.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
        } catch (Exception ignore) {
            // 解析器不支持该 feature 时忽略
        }
        DocumentBuilder db = dbf.newDocumentBuilder();
        Document doc = db.parse(new InputSource(new StringReader(xml)));
        NodeList nodes = doc.getElementsByTagName("*");
        TreeSet<String> candidates = new TreeSet<String>();
        for (int i = 0; i < nodes.getLength(); i++) {
            Element el = (Element) nodes.item(i);
            for (String attr : CLASS_NAME_ATTRS) {
                String v = el.getAttribute(attr);
                if (v != null && !v.isEmpty()
                        && v.matches("[A-Za-z_][A-Za-z0-9_]*(\\.[A-Za-z_][A-Za-z0-9_]*)+")) {
                    candidates.add(v);
                }
            }
        }
        for (String c : candidates) {
            try {
                Class.forName(c);
            } catch (Throwable t) {
                try {
                    configuration.getTypeAliasRegistry().registerAlias(c, Object.class);
                } catch (Throwable ignore) {
                    // 重复注册等场景忽略
                }
            }
        }
    }

    /**
     * 规范化粘贴的 mapper 内容并统一补 DOCTYPE。
     * MyBatis 的 InputStream 构造器强制 DTD 校验，无论完整文档还是片段，
     * 无 DOCTYPE 都会报"根元素必须匹配 DOCTYPE 根 null"；
     * 该 DTD 由 MyBatis 本地解析，离线可用。
     */
    static String normalizeMapperXml(String xml) {
        String t = xml.trim();
        String body = t
                .replaceAll("(?i)^<\\?xml[^>]*\\?>", "")
                .replaceAll("(?i)<!DOCTYPE[^>]*>", "")
                .trim();
        String doc;
        if (body.matches("(?s).*<mapper[\\s>].*")) {
            doc = body; // 已是完整 mapper 文档
        } else {
            doc = "<mapper namespace=\"PASTED\">\n" + body + "\n</mapper>";
        }
        return "<!DOCTYPE mapper PUBLIC \"-//mybatis.org//DTD Mapper 3.0//EN\" \"http://mybatis.org/dtd/mybatis-3-mapper.dtd\">\n"
                + doc;
    }

    private static String rootMessage(Throwable t) {
        Throwable cur = t;
        while (cur.getCause() != null && cur.getCause() != cur) {
            cur = cur.getCause();
        }
        String m = cur.getMessage();
        return m == null || m.isEmpty() ? t.toString() : m;
    }

    /** 渲染结果：SQL + 过程告警 */
    public static class RenderResult {
        public String sql;
        public final List<String> warnings = new ArrayList<String>();
    }

    /** statement 元信息：全限定 id + SQL 类型（SELECT/INSERT/UPDATE/DELETE） */
    public static class StatementInfo {
        public final String id;
        public final String type;

        public StatementInfo(String id, String type) {
            this.id = id;
            this.type = type;
        }
    }
}
