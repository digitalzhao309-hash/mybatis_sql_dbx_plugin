package digitalzhao.mybatis_sql_dbx_plugin;

/**
 * 数据库方言（仅两种）：决定字符串/日期/布尔值的字面量写法。
 * <ul>
 *   <li>ORACLE：Oracle 11g 及以下习惯（TO_DATE / TO_TIMESTAMP，字符串 '...'）</li>
 *   <li>SQLSERVER：SQL Server 2012+ 习惯（字符串 N'...'，日期字符串字面量）</li>
 * </ul>
 */
public enum Dialect {

    ORACLE,
    SQLSERVER;

    public static Dialect of(String name) {
        if (name == null || name.trim().isEmpty()) {
            return ORACLE;
        }
        String n = name.trim().toLowerCase().replace(" ", "").replace("-", "");
        if ("oracle".equals(n) || "ora".equals(n) || "oracle11".equals(n) || "oracle11g".equals(n)) {
            return ORACLE;
        }
        if ("sqlserver".equals(n) || "mssql".equals(n)) {
            return SQLSERVER;
        }
        throw new IllegalArgumentException("不支持的数据库类型: " + name + "（支持: oracle / sqlserver）");
    }

    public boolean isOracleFamily() {
        return this == ORACLE;
    }

    public boolean isSqlServerFamily() {
        return this == SQLSERVER;
    }

    /** MyBatis databaseId：用于匹配 mapper 中带 databaseId 属性的 statement */
    public String databaseId() {
        return this == ORACLE ? "oracle" : "sqlserver";
    }
}
