# 后端接口需求：数据源字段查询 API

> 前端已就绪，等待后端实现此接口后 Monaco 编辑器 `obj.` 自动补全即可生效。

## 接口定义

```
GET /services/fwcore/datasource/fields/{datasourceId}
```

### 请求

| 参数 | 位置 | 类型 | 说明 |
|------|------|------|------|
| datasourceId | path | Long | 数据源 ID（md_integration_datasource.id）|

### 响应

```json
{
  "model": [
    { "fieldName": "id", "fieldType": "number", "comment": "主键" },
    { "fieldName": "name", "fieldType": "string", "comment": "名称" },
    { "fieldName": "amount", "fieldType": "number", "comment": "金额" }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| fieldName | string | 字段名（前端用于 `obj.fieldName` 补全） |
| fieldType | string | 类型（string/number/boolean，前端用于类型推断） |
| comment | string | 备注（前端显示为补全提示文档） |

---

## 实现位置

| 层 | 文件 | 说明 |
|----|------|------|
| Controller | `MdIntegrationDatasourceController.java` | 新增 `@GetMapping("/datasource/fields/{datasourceId}")` |
| Service | `MdIntegrationDatasourceService.java` | 新增 `getFields(Long datasourceId)` 方法 |

## 实现逻辑

```
1. 根据 datasourceId 查询 md_integration_datasource 表获取数据源配置
2. 解析 configValue（JSON），提取连接信息
3. 根据 type 字段分派：
   - type="db"  → 连接数据库，查询 INFORMATION_SCHEMA.COLUMNS
   - type="api" → 从 configValue 中提取字段映射（如有）
   - 其他类型   → 返回空数组
4. 返回字段列表
```

## DB 类型实现要点

### 连接数据库

```java
// 从 configValue 解析连接信息
JSONObject config = JSONObject.parseObject(datasource.getConfigValue());
String url = config.getString("url");       // 或 jdbcUrl
String username = config.getString("username");
String password = config.getString("password");

// 参考现有代码 MdIntegrationDatasourceController.getDbUrl()
// 根据 classify 拼接 JDBC URL
```

### 各数据库查询字段的 SQL

**MySQL**:
```sql
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '{tableName}'
```

**Oracle**:
```sql
SELECT COLUMN_NAME, DATA_TYPE, COMMENTS
FROM USER_COL_COMMENTS A JOIN USER_TAB_COLUMNS B
ON A.TABLE_NAME = B.TABLE_NAME AND A.COLUMN_NAME = B.COLUMN_NAME
WHERE A.TABLE_NAME = '{tableName}'
```

**PostgreSQL**:
```sql
SELECT column_name, udt_name,
  col_description((table_schema||'.'||table_name)::regclass, ordinal_position) AS comment
FROM information_schema.columns
WHERE table_name = '{tableName}'
```

**SQL Server**:
```sql
SELECT c.COLUMN_NAME, c.DATA_TYPE,
  ep.value AS comment
FROM INFORMATION_SCHEMA.COLUMNS c
LEFT JOIN sys.extended_properties ep
  ON ep.major_id = OBJECT_ID(c.TABLE_NAME) AND ep.minor_id = c.ORDINAL_POSITION
WHERE c.TABLE_NAME = '{tableName}'
```

### 类型映射

| DB 类型 | → fieldType |
|---------|------------|
| int/bigint/decimal/numeric/float/double | number |
| bit/boolean | boolean |
| 其他（varchar/char/text/date/datetime/...） | string |

### 注意事项

1. **密码解密**：configValue 中的 password 可能经过 `JasyptUtil.encode()` 加密，需解密
2. **tableName 来源**：集成配置的 inNode/outNode configValue 中有 `tableName` 字段，可作为额外参数传入；如无则查询默认表
3. **SQL 注入**：tableName 需做白名单校验，不可直接拼接
4. **连接超时**：设置合理的超时（如 5 秒），避免阻塞
5. **租户隔离**：验证当前用户有权访问该数据源

---

## 前端已完成的部分

| 文件 | 改动 |
|------|------|
| `src/api/IntegratedConfig.js` | 已添加 `getDatasourceFields(datasourceId)` |
| `src/views/integrationConfig/index.vue` | 已在打开输入/输出节点对话框时调用 `loadDatasourceFields()` |
| `src/views/integrationConfig/moudel/monaco.vue` | 已实现 `fields` prop → CompletionItemProvider + addExtraLib |

**后端接口上线后，前端无需任何改动，`obj.` 自动补全自动生效。**
