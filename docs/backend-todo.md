# 后端待办事项

> 来源: 前端开发过程中发现的需要后端配合处理的事项

---

### BE01 下发接口改为异步

**现状**: `GET /services/fwcore/config/send/{id}` 同步等待 Agent 重载完成后才返回，任务多/脚本大时容易超时。前端已临时将 timeout 从 15s 放宽到 120s，加了全屏 loading。

**建议**: 后端改为异步模式 — 立即返回下发任务 ID，前端轮询状态直到完成。

**优先级**: 中

---

### BE02 datasource/fields 接口未实现

**现状**: 前端 `GET /services/fwcore/datasource/fields/{id}` 返回 404。Monaco 编辑器的字段自动补全依赖此接口。

**建议**: 在 `MdIntegrationDatasourceController` 新增端点，根据数据源类型（JDBC/API/SAP）获取表字段 metadata。

**优先级**: 低

---

### BE03 数据源 ID 类型不一致

**现状**: freelist 接口 `bcp.datasource.name` 返回的 Map key 类型与集成配置中 dataSource 字段类型不一致（数字 vs 字符串），导致 admin 登录时数据源下拉框显示 ID 而非名称。前端已做 `+ ''` 兼容，但根因在后端数据类型不统一。

**建议**: 后端统一 dataSource 字段为字符串类型。

**优先级**: 低
