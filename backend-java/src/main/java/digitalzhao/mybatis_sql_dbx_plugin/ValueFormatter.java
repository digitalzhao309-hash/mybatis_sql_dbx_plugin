package digitalzhao.mybatis_sql_dbx_plugin;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.regex.Pattern;

/**
 * 按 JDBC 类型习惯把 Java 值格式化为 SQL 字面量，并区分 Oracle / SQL Server 方言：
 * <ul>
 *   <li>字符串：Oracle 用 '...'；SQL Server 用 N'...'（兼容中文）</li>
 *   <li>日期类型：Oracle 用 TO_DATE / TO_TIMESTAMP；SQL Server 用字符串字面量（隐式转换）</li>
 *   <li>日期样式字符串（yyyy-MM-dd / yyyy-MM-dd HH:mm:ss[.SSS]）：Oracle 侧同样生成
 *       TO_DATE(...) / TO_TIMESTAMP(...)，SQL Server 保持字符串字面量（隐式转换可靠）</li>
 *   <li>布尔：两种库均输出 1 / 0</li>
 * </ul>
 */
public final class ValueFormatter {

    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter TS_MS = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");
    /** 用于解析（'T' 连接）校验日期时间字符串的有效性 */
    private static final DateTimeFormatter TS_PATTERN = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    private static final DateTimeFormatter TS_MS_PATTERN = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /** 纯日期字符串：yyyy-MM-dd */
    private static final Pattern DATE_ONLY = Pattern.compile("^\\d{4}-\\d{2}-\\d{2}$");
    /** 日期时间字符串：yyyy-MM-dd HH:mm:ss[.SSS]（毫秒固定 3 位、可选） */
    private static final Pattern DATE_TIME = Pattern.compile("^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}(\\.\\d{3})?$");

    private ValueFormatter() {
    }

    public static String format(Object value, Dialect dialect) {
        if (value == null) {
            return "NULL";
        }
        if (value instanceof Boolean) {
            return ((Boolean) value).booleanValue() ? "1" : "0";
        }
        // 浮点数避免科学计数法
        if (value instanceof Float || value instanceof Double) {
            return new BigDecimal(String.valueOf(value)).stripTrailingZeros().toPlainString();
        }
        if (value instanceof Number) { // Integer / Long / BigDecimal / BigInteger ...
            return value.toString();
        }
        if (value instanceof Character) {
            return quote(String.valueOf(value), dialect);
        }
        if (value instanceof Enum) {
            return quote(((Enum<?>) value).name(), dialect);
        }
        if (value instanceof String) {
            String s = (String) value;
            String dateLiteral = tryFormatDateString(s, dialect);
            if (dateLiteral != null) {
                return dateLiteral;
            }
            return quote(s, dialect);
        }
        if (value instanceof java.sql.Date) {
            return formatDate(((java.sql.Date) value).toLocalDate(), dialect);
        }
        if (value instanceof LocalDate) {
            return formatDate((LocalDate) value, dialect);
        }

        String s;
        boolean hasMillis;
        if (value instanceof LocalDateTime) {
            LocalDateTime t = (LocalDateTime) value;
            hasMillis = t.getNano() / 1_000_000 > 0;
            s = (hasMillis ? TS_MS : TS).format(t);
        } else if (value instanceof Timestamp) {
            LocalDateTime t = ((Timestamp) value).toLocalDateTime();
            hasMillis = t.getNano() / 1_000_000 > 0;
            s = (hasMillis ? TS_MS : TS).format(t);
        } else if (value instanceof OffsetDateTime) {
            LocalDateTime t = ((OffsetDateTime) value).toLocalDateTime();
            hasMillis = t.getNano() / 1_000_000 > 0;
            s = (hasMillis ? TS_MS : TS).format(t);
        } else if (value instanceof ZonedDateTime) {
            LocalDateTime t = ((ZonedDateTime) value).toLocalDateTime();
            hasMillis = t.getNano() / 1_000_000 > 0;
            s = (hasMillis ? TS_MS : TS).format(t);
        } else if (value instanceof Date) { // java.util.Date
            Date d = (Date) value;
            hasMillis = d.getTime() % 1000 != 0;
            SimpleDateFormat f = new SimpleDateFormat(hasMillis ? "yyyy-MM-dd HH:mm:ss.SSS" : "yyyy-MM-dd HH:mm:ss");
            s = f.format(d);
        } else {
            // 兜底：数组、集合等不该出现在单值位置，按字符串输出便于排查
            return quote(String.valueOf(value), dialect);
        }
        return formatDateTime(s, hasMillis, dialect);
    }

    /**
     * 日期样式字符串识别：仅 Oracle 生效，SQL Server 恒返回 null（保持字符串字面量，隐式转换可靠）。
     * 匹配 yyyy-MM-dd / yyyy-MM-dd HH:mm:ss[.SSS]，并通过 LocalDate/LocalDateTime 解析校验有效性，
     * 非法日期（如 2024-13-45）按普通字符串处理。
     */
    private static String tryFormatDateString(String s, Dialect dialect) {
        if (!dialect.isOracleFamily()) {
            return null;
        }
        if (DATE_ONLY.matcher(s).matches()) {
            try {
                LocalDate.parse(s); // 校验有效性
                return "TO_DATE('" + s + "', 'YYYY-MM-DD')";
            } catch (Exception ignore) {
                return null;
            }
        }
        if (DATE_TIME.matcher(s).matches()) {
            boolean hasMillis = s.contains(".");
            try {
                if (hasMillis) {
                    LocalDateTime.parse(s.replace(' ', 'T'), TS_MS_PATTERN);
                } else {
                    LocalDateTime.parse(s.replace(' ', 'T'), TS_PATTERN);
                }
                return hasMillis
                        ? "TO_TIMESTAMP('" + s + "', 'YYYY-MM-DD HH24:MI:SS.FF3')"
                        : "TO_DATE('" + s + "', 'YYYY-MM-DD HH24:MI:SS')";
            } catch (Exception ignore) {
                return null;
            }
        }
        return null;
    }

    private static String formatDate(LocalDate d, Dialect dialect) {
        String s = DateTimeFormatter.ISO_LOCAL_DATE.format(d);
        if (dialect.isOracleFamily()) {
            return "TO_DATE('" + s + "', 'YYYY-MM-DD')";
        }
        return "'" + s + "'";
    }

    private static String formatDateTime(String s, boolean hasMillis, Dialect dialect) {
        if (dialect.isOracleFamily()) {
            return hasMillis
                    ? "TO_TIMESTAMP('" + s + "', 'YYYY-MM-DD HH24:MI:SS.FF3')"
                    : "TO_DATE('" + s + "', 'YYYY-MM-DD HH24:MI:SS')";
        }
        return "'" + s + "'";
    }

    private static String quote(String s, Dialect dialect) {
        String escaped = s.replace("'", "''");
        return dialect.isSqlServerFamily() ? "N'" + escaped + "'" : "'" + escaped + "'";
    }
}
