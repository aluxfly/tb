# 标书模板说明

本目录存放标书生成用的模板文件。

## DOCX 模板要求

### 模板文件命名
- `tech-bid-template.docx` - 技术标模板
- `commercial-bid-template.docx` - 商务标模板

### 占位符语法（docxtemplater）

使用以下占位符，docxtemplater 会自动替换：

```xml
{# tender}
项目编号：{id}
项目名称：{title}
所属地区：{region}
所属行业：{industry}
预算金额：{budget} 万元
截止时间：{deadline}
项目描述：{description}
{/tender}

{# company}
企业名称：{name}
资质列表：
{# qualifications}
- {.}
{/qualifications}
{/company}

{# meta}
生成日期：{generatedDate}
生成工具：{generator}
{/meta}
```

### 如何制作模板

1. 用 Microsoft Word 或 WPS 设计标书格式
2. 在需要填充的位置插入占位符 `{fieldName}`
3. 保存为 `.docx` 格式
4. 放入本目录

### 获取初始模板

可以从以下位置下载示例模板：
- [docxtemplater 官方示例](https://github.com/open-xml-templating/docxtemplater)

### 更新模板

替换 `public/bid-templates/` 下的文件后，无需修改代码，系统会自动加载新模板。
