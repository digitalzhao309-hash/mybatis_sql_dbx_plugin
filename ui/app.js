/* MyBatis SQL 生成器 — DBX 工作台逻辑
 * 运行于 DBX 宿主 iframe 沙箱：通过 window.dbxPlugin 与宿主 / Sidecar 通信。
 * - statement 识别与 SQL 渲染均由 Java Sidecar 完成（复用 MyBatis 官方引擎）。
 * - 无宿主时进入离线预览模式（仅编辑，不渲染）。 */
(function () {
  "use strict";

  var plugin = window.dbxPlugin || null;

  // ---------------------------------------------------------------- i18n
  var I18N = {
    zh: {
      title: "MyBatis SQL 生成器",
      dialect: "方言",
      loadExample: "载入示例",
      render: "转换 SQL",
      copy: "复制结果",
      mapperLabel: "Mapper XML",
      mapperHint: "完整 XML / 片段均可",
      paramsLabel: "入参",
      paramsHint: "JSON（{...} / [...]）或 GET 参数串 k=v&k=v",
      statementLabel: "Statement",
      noMatch: "无匹配 statement",
      outputLabel: "生成的 SQL",
      offline: "未检测到 DBX 宿主（window.dbxPlugin），请通过 DBX 或 dbx-plugin dev 打开",
      statusReady: "就绪",
      statusRendering: "渲染中…",
      statusDone: "转换完成",
      statusCopied: "已复制到剪贴板",
      statusListError: "statement 识别失败",
      statusError: "错误",
      warnEmptyMapper: "请先粘贴 mapper XML",
      warnNoStatement: "请选择 statement",
      warnNothingToCopy: "暂无可复制的结果",
      warnOfflineRender: "离线模式无法渲染（未检测到 DBX 宿主）",
      statusDbIdHint: "XML 声明了 databaseId {a}，与当前方言（{b}）不一致，statement 被跳过；请切换方言"
    },
    en: {
      title: "MyBatis SQL Generator",
      dialect: "Dialect",
      loadExample: "Load example",
      render: "Render SQL",
      copy: "Copy result",
      mapperLabel: "Mapper XML",
      mapperHint: "full XML or fragment",
      paramsLabel: "Parameters",
      paramsHint: "JSON ({...} / [...]) or query string k=v&k=v",
      statementLabel: "Statement",
      noMatch: "No matching statement",
      outputLabel: "Generated SQL",
      offline: "DBX host not detected (window.dbxPlugin). Open via DBX or dbx-plugin dev.",
      statusReady: "Ready",
      statusRendering: "Rendering…",
      statusDone: "Done",
      statusCopied: "Copied to clipboard",
      statusListError: "Failed to list statements",
      statusError: "Error",
      warnEmptyMapper: "Paste mapper XML first",
      warnNoStatement: "Please select a statement",
      warnNothingToCopy: "Nothing to copy yet",
      warnOfflineRender: "Offline mode: rendering requires the DBX host",
      statusDbIdHint: "Mapper declares databaseId {a}, which does not match the current dialect ({b}); switch the dialect"
    }
  };

  var locale = "zh";
  function t(key) {
    return (I18N[locale] && I18N[locale][key]) || I18N.zh[key] || key;
  }

  function detectLocale() {
    // 优先宿主下发语言（init/env 消息），回退 WebView 语言
    var raw = (plugin && plugin.locale) || navigator.language || "zh-CN";
    return String(raw).toLowerCase().indexOf("en") === 0 ? "en" : "zh";
  }

  function applyI18n() {
    document.documentElement.lang = locale === "en" ? "en" : "zh-CN";
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = t(nodes[i].getAttribute("data-i18n"));
    }
  }

  function applyTheme() {
    if (!plugin || !plugin.theme) return;
    var appearance = plugin.theme.appearance;
    if (appearance) {
      document.documentElement.setAttribute("data-dbx-theme", appearance);
    }
  }

  // ---------------------------------------------------------------- utils
  var seq = { render: 0, list: 0 };
  var lastSql = "";

  function $(id) { return document.getElementById(id); }

  function setStatus(text, isError) {
    var el = $("status");
    el.textContent = text;
    el.className = isError ? "error" : "";
  }

  function errText(e) {
    return (e && e.message) ? e.message : String(e);
  }

  function invoke(method, params) {
    return plugin.invoke(method, params, { timeoutMs: 30000 });
  }

  // ------------------------------------------------- persistent UI state
  function storageAvailable() {
    return !!(plugin && plugin.capabilities && plugin.capabilities.storage && plugin.storage);
  }

  var saveTimer = null;
  function scheduleSaveState() {
    if (!storageAvailable()) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveState, 800);
  }

  function saveState() {
    if (!storageAvailable()) return;
    plugin.storage.set("state", {
      mapper: $("mapper").value,
      params: $("params").value,
      dialect: $("dialect").value,
      statement: $("statement").value
    }).catch(function () { /* 存储失败可忽略 */ });
  }

  async function restoreState() {
    if (!storageAvailable()) return;
    try {
      var s = await plugin.storage.get("state");
      if (s) {
        if (typeof s.mapper === "string") $("mapper").value = s.mapper;
        if (typeof s.params === "string") $("params").value = s.params;
        if (s.dialect === "oracle" || s.dialect === "sqlserver") $("dialect").value = s.dialect;
        // 列表尚未填充，先记下首选值，fillStatements 时恢复
        if (typeof s.statement === "string") pendingStatement = s.statement;
      }
    } catch (e) { /* 首次运行无状态 */ }
  }

  // ------------------------------------------------ statement 识别（Sidecar）
  var pendingStatement = ""; // 面板重建后需恢复的首选值（来自存储或示例）
  var statementIds = [];     // 全部候选（短 id，XML 声明顺序，不排序）
  var comboVisible = [];     // 下拉面板当前可见项（过滤后）
  var comboHighlighted = -1; // 面板当前高亮项下标

  function fillStatements(list) {
    statementIds = [];
    for (var i = 0; i < list.length; i++) {
      // 只显示短 id（去掉 namespace 前缀）；渲染时后端 resolveStatement 兼容短 id
      statementIds.push(list[i].id.substring(list[i].id.lastIndexOf(".") + 1));
    }
    var input = $("statement");
    var cur = input.value || pendingStatement;
    pendingStatement = "";
    // XML / 方言变化后默认 Statement 跟随新列表：仍有效则保持，否则自动选第一条
    if (statementIds.length) {
      if (statementIds.indexOf(cur) === -1) {
        input.value = statementIds[0];
        scheduleSaveState();
      } else if (input.value !== cur) {
        input.value = cur;
      }
    } else if (input.value !== "") {
      input.value = "";
      scheduleSaveState();
    }
    // 面板展开中则实时刷新列表内容
    if (!$("statement-list").hidden) {
      renderComboPanel(input.value);
    }
  }

  // ---- Statement combobox：输入框 + 常驻全量列表 + 模糊定位  ----
  function renderComboPanel(filter, highlightValue) {
    var panel = $("statement-list");
    var f = String(filter || "").toLowerCase();
    panel.innerHTML = "";
    comboVisible = [];
    for (var i = 0; i < statementIds.length; i++) {
      var id = statementIds[i];
      if (f && id.toLowerCase().indexOf(f) === -1) continue; // 大小写不敏感子串模糊过滤
      var li = document.createElement("li");
      li.textContent = id;
      panel.appendChild(li);
      comboVisible.push(id);
    }
    if (!comboVisible.length) {
      var empty = document.createElement("li");
      empty.className = "combo-empty";
      empty.textContent = t("noMatch");
      panel.appendChild(empty);
    }
    panel.hidden = false;
    $("statement-combo").classList.add("open");
    positionComboPanel();
    // 高亮：优先定位 highlightValue（展开时定位当前值），否则第一个匹配项
    var hi = -1;
    if (highlightValue) {
      for (var j = 0; j < comboVisible.length; j++) {
        if (comboVisible[j] === highlightValue) { hi = j; break; }
      }
    }
    setComboHighlight(hi >= 0 ? hi : (comboVisible.length ? 0 : -1));
  }

  // 面板定位：下方空间不足且上方更宽裕时向上弹出（dropup）；
  // 可用空间小于列表高度时压缩 maxHeight，使长列表在面板内部滚动，不撑出页面滚动条
  function positionComboPanel() {
    var panel = $("statement-list");
    var combo = $("statement-combo");
    panel.classList.remove("dropup");
    var rect = combo.getBoundingClientRect();
    var below = window.innerHeight - rect.bottom - 8; // 下方可用空间（留 8px 边距）
    var above = rect.top - 8;                          // 上方可用空间
    var h = Math.min(panel.scrollHeight, 240);         // 期望高度（与 CSS max-height 一致）
    var up = below < h && above > below;
    var avail = up ? above : below;
    if (avail < h) h = Math.max(60, Math.min(h, avail)); // 空间不足则压缩高度，面板内部滚动
    panel.style.maxHeight = h + "px";
    panel.classList.toggle("dropup", up);
  }

  function setComboHighlight(idx) {
    var items = $("statement-list").querySelectorAll("li:not(.combo-empty)");
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle("active", i === idx);
    }
    comboHighlighted = idx;
    if (items[idx] && items[idx].scrollIntoView) {
      items[idx].scrollIntoView({ block: "nearest" });
    }
  }

  function closeComboPanel() {
    $("statement-list").hidden = true;
    $("statement-combo").classList.remove("open");
    comboHighlighted = -1;
  }

  function pickStatement(value) {
    $("statement").value = value;
    closeComboPanel();
    scheduleSaveState();
  }

  function scheduleListStatements() {
    if (!plugin) return;
    clearTimeout(scheduleListStatements._timer);
    scheduleListStatements._timer = setTimeout(async function () {
      var mapperText = $("mapper").value;
      if (!mapperText.trim()) { fillStatements([]); return; }
      var mySeq = ++seq.list;
      try {
        var res = await invoke("sql/listStatements", {
          mapperText: mapperText,
          dialect: $("dialect").value
        });
        if (mySeq === seq.list) {
          fillStatements(res.statements || []);
          var hint = res.hint;
          if (hint && hint.declared && hint.declared.length) {
            setStatus(t("statusDbIdHint")
              .replace("{a}", hint.declared.join(", "))
              .replace("{b}", hint.current || ""), true);
          }
        }
      } catch (e) {
        setStatus(t("statusListError") + ": " + errText(e), true);
      }
    }, 500);
  }

  // ------------------------------------------------ 渲染（Sidecar）
  async function render() {
    var mapperText = $("mapper").value;
    if (!mapperText.trim()) { setStatus(t("warnEmptyMapper"), true); return; }
    if (!$("statement").value.trim()) { setStatus(t("warnNoStatement"), true); return; }
    if (!plugin) { setStatus(t("warnOfflineRender"), true); return; }

    var mySeq = ++seq.render;
    setStatus(t("statusRendering"));
    try {
      var res = await invoke("sql/render", {
        mapperText: mapperText,
        statementId: $("statement").value.trim(),
        paramsText: $("params").value,
        dialect: $("dialect").value
      });
      if (mySeq !== seq.render) return;
      lastSql = res.sql || "";
      $("output").textContent = lastSql;
      showWarnings(res.warnings || []);
      setStatus(t("statusDone"));
      scheduleSaveState();
    } catch (e) {
      if (mySeq !== seq.render) return;
      lastSql = "";
      $("output").textContent = "";
      showWarnings([]);
      setStatus(t("statusError") + ": " + errText(e), true);
    }
  }

  function showWarnings(list) {
    var box = $("warnings");
    if (!list || !list.length) {
      box.hidden = true;
      box.textContent = "";
      return;
    }
    box.hidden = false;
    box.textContent = list.join("\n");
  }

  // ------------------------------------------------ 剪贴板 / 示例
  async function copyResult() {
    var text = lastSql || $("output").textContent;
    if (!text.trim()) { setStatus(t("warnNothingToCopy"), true); return; }
    try {
      if (plugin && plugin.copy) {
        await plugin.copy(text);
      } else {
        await navigator.clipboard.writeText(text);
      }
      setStatus(t("statusCopied"));
    } catch (e) {
      setStatus(t("statusError") + ": " + errText(e), true);
    }
  }

  function loadExample() {
    $("mapper").value =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">\n' +
      '<mapper namespace="com.example.DemoMapper">\n' +
      '\n' +
      '    <select id="selectList" resultType="map">\n' +
      '        SELECT\n' +
      '            t1.id,\n' +
      '            t1.no,\n' +
      '            t1.status\n' +
      '        FROM\n' +
      '            demo1 t1\n' +
      '            INNER JOIN demo2 t2 on t1.userid = t2.userid\n' +
      '        WHERE\n' +
      '            t1.no = #{No}\n' +
      '            and t1.userid = #{userId}\n' +
      '    </select>\n' +
      '\n' +
      '    <select id="selectByIds" resultType="map">\n' +
      '        SELECT id, user_name FROM demo_user WHERE id IN\n' +
      '        <foreach collection="ids" item="item" open="(" separator="," close=")">#{item}</foreach>\n' +
      '    </select>\n' +
      '\n' +
      '</mapper>';
    $("params").value = '{"No": "O2024001", "userId": "U2024001"}';
    pendingStatement = "selectList";
    $("output").textContent = "";
    showWarnings([]);
    setStatus(t("statusReady"));
    scheduleListStatements();
    scheduleSaveState();
  }

  // ------------------------------------------------ 离线预览模式
  function enterOfflineMode() {
    $("offline").hidden = false;
    setStatus(t("statusReady"));
  }

  // ------------------------------------------------ 启动
  function wireEvents() {
    $("btn-render").addEventListener("click", render);
    $("btn-copy").addEventListener("click", copyResult);
    $("btn-example").addEventListener("click", loadExample);

    $("mapper").addEventListener("input", function () {
      scheduleListStatements();
      scheduleSaveState();
    });
    $("params").addEventListener("input", scheduleSaveState);
    // ---- Statement combobox 交互 ----
    var comboInput = $("statement");
    var comboPanel = $("statement-list");
    comboInput.addEventListener("focus", function () {
      renderComboPanel("", comboInput.value); // 展开常驻全量列表（XML 声明顺序），定位当前值
    });
    comboInput.addEventListener("input", function () {
      renderComboPanel(comboInput.value); // 输入即模糊过滤并高亮第一个匹配
      scheduleSaveState();
    });
    comboInput.addEventListener("keydown", function (e) {
      var open = !comboPanel.hidden;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!open) { renderComboPanel("", comboInput.value); return; }
        if (!comboVisible.length) return;
        var delta = e.key === "ArrowDown" ? 1 : -1;
        setComboHighlight((comboHighlighted + delta + comboVisible.length) % comboVisible.length);
      } else if (e.key === "Enter") {
        if (open && comboHighlighted >= 0 && comboVisible[comboHighlighted]) {
          e.preventDefault();
          pickStatement(comboVisible[comboHighlighted]);
        }
      } else if (e.key === "Escape" && open) {
        e.preventDefault();
        closeComboPanel();
      }
    });
    comboInput.addEventListener("blur", function () {
      // 延迟收起，给列表项的 mousedown 留出处理时间
      setTimeout(closeComboPanel, 120);
    });
    comboPanel.addEventListener("mousedown", function (e) {
      // mousedown + preventDefault：避免 input 先失焦把面板收起
      e.preventDefault();
      var li = e.target.closest("li");
      if (li && !li.classList.contains("combo-empty")) pickStatement(li.textContent);
    });
    $("statement-arrow").addEventListener("mousedown", function (e) {
      e.preventDefault(); // 防止 input 失焦导致面板先收起
    });
    $("statement-arrow").addEventListener("click", function () {
      if (comboPanel.hidden) {
        comboInput.focus();
        renderComboPanel("", comboInput.value);
      } else {
        closeComboPanel();
      }
    });
    document.addEventListener("mousedown", function (e) {
      if (!comboPanel.hidden && !$("statement-combo").contains(e.target)) closeComboPanel();
    });
    $("dialect").addEventListener("change", function () {
      scheduleListStatements();
      scheduleSaveState();
    });

    // Ctrl/Cmd + Enter 快速转换
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        render();
      }
    });

    window.addEventListener("dbx-plugin-env", function () {
      if (!plugin) return;
      locale = detectLocale();
      applyI18n();
      applyTheme();
    });
  }

  async function loadLogo() {
    try {
      var url = await plugin.readAssetUrl("assets/plugin.svg");
      var img = $("logo");
      img.src = url;
      img.hidden = false;
    } catch (e) { /* 图标加载失败不影响功能 */ }
  }

  async function boot() {
    locale = detectLocale();
    applyI18n();
    wireEvents();

    if (!plugin) {
      enterOfflineMode();
      return;
    }

    try {
      await plugin.ready;
    } catch (e) {
      setStatus(t("statusError") + ": " + errText(e), true);
      return;
    }

    // 宿主在 init 消息中才下发真实语言并 resolve ready（init 触发 dbx-plugin-init 而非 dbx-plugin-env），
    // 因此 ready 后必须按宿主语言重设 UI，否则停留在 bridge 初始默认文案。
    locale = detectLocale();
    applyI18n();
    applyTheme();
    loadLogo();
    await restoreState();
    setStatus(t("statusReady"));
    scheduleListStatements();
  }

  boot();
})();
