import { Tender, Qualification } from "../types/tender";

/**
 * 标书生成器 - 支持 DOCX 和 PDF 格式
 */
export class BidGenerator {
  private tender: Tender;
  private qualifications: Qualification[];

  constructor(tender: Tender, qualifications: Qualification[]) {
    this.tender = tender;
    this.qualifications = qualifications;
  }

  /**
   * 生成 DOCX 标书（基于模板填充）
   */
  async generateDocx(templatePath: string): Promise<Blob> {
    // 动态加载 docxtemplater
    const { default: Docxtemplater } = await import("docxtemplater");
    const PizZip = (await import("pizzip")).default;
    const JSZipUtils = (await import("jszip-utils")).default;

    return new Promise((resolve, reject) => {
      JSZipUtils.getBinaryContent(templatePath, (error: Error | null, data: ArrayBuffer) => {
        if (error) {
          reject(error);
          return;
        }

        const zip = new PizZip(data);
        const doc = new Docxtemplater();
        
        doc.loadZip(zip);

        // 准备填充数据
        const templateData = this.prepareTemplateData();

        try {
          doc.setData(templateData);
          doc.render();
          const updatedZip = doc.getZip();
          const blob = updatedZip.generate({
            type: "blob",
            mimeType:
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document; charset=utf-8",
          });
          resolve(blob);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * 生成 PDF 标书（基于 HTML 模板）
   */
  async generatePdf(): Promise<Blob> {
    // 使用浏览器原生打印功能生成 PDF
    // 需要在 DOM 中渲染 HTML 模板
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;

    // 构建 HTML 模板
    const html = this.buildHtmlTemplate();
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.innerHTML = html;
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 190;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const blob = pdf.output("blob");
      return blob;
    } finally {
      document.body.removeChild(container);
    }
  }

  /**
   * 准备模板数据（企业信息 + 项目信息）
   */
  private prepareTemplateData(): Record<string, unknown> {
    const today = new Date().toISOString().split("T")[0];
    
    // 提取企业信息
    const companyInfo = this.qualifications.length > 0 ? {
      name: "企业名称", // TODO: 从用户输入或资质中提取
      qualifications: this.qualifications.map(q => q.name),
      validCertifications: this.qualifications
        .filter(q => q.status === "valid")
        .map(q => `${q.name}（${q.issuingAuthority}）`),
    } : {
      name: "未录入企业信息",
      qualifications: [],
      validCertifications: [],
    };

    // 技术标章节
    const techSections = [
      {
        title: "企业概况",
        content: this.buildCompanyProfile(companyInfo),
      },
      {
        title: "项目理解",
        content: this.buildProjectUnderstanding(),
      },
      {
        title: "技术方案",
        content: this.buildTechnicalSolution(),
      },
      {
        title: "实施计划",
        content: this.buildImplementationPlan(),
      },
      {
        title: "质量保证",
        content: this.buildQualityAssurance(),
      },
    ];

    // 商务标章节
    const commercialSections = [
      {
        title: "报价明细",
        content: this.buildPriceDetail(),
      },
      {
        title: "商务条款响应",
        content: this.buildCommercialResponse(),
      },
      {
        title: "资格证明文件",
        content: this.buildQualificationProof(companyInfo),
      },
    ];

    return {
      tender: {
        id: this.tender.id,
        title: this.tender.title,
        region: this.tender.region,
        industry: this.tender.industry,
        budget: this.tender.budget,
        deadline: this.tender.deadline,
        description: this.tender.description,
        requiredQualifications: this.tender.requiredQualifications,
      },
      company: companyInfo,
      techBid: {
        sections: techSections,
        totalScore: this.calculateTechScore(),
      },
      commercialBid: {
        sections: commercialSections,
        totalPrice: this.tender.budget * 0.85, // 示例：85%报价
      },
      meta: {
        generatedDate: today,
        generator: "智标通标书工厂",
        version: "1.0",
      },
    };
  }

  /**
   * 构建 HTML 模板（用于 PDF 生成）
   */
  private buildHtmlTemplate(): string {
    const data = this.prepareTemplateData();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: "Microsoft YaHei", sans-serif; padding: 40px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .subtitle { font-size: 18px; color: #666; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 16px; font-weight: bold; border-left: 4px solid #0066cc; padding-left: 10px; margin-bottom: 15px; }
          .info-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .info-table th, .info-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .info-table th { background-color: #f5f5f5; }
          .qualification-item { margin: 5px 0; padding: 5px 10px; background: #f9f9f9; border-radius: 4px; }
          .signature { margin-top: 50px; display: flex; justify-content: space-between; }
          .signature-block { text-align: center; width: 200px; }
          .footer { text-align: center; margin-top: 40px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${data.tender.title}</div>
          <div class="subtitle">标书文件 · 生成时间：${data.meta.generatedDate}</div>
        </div>

        <!-- 技术标 -->
        <div class="section">
          <div class="section-title">第一部分 技术标</div>
          ${(data.techBid as any).sections.map((sec: any) => `
            <h3>${sec.title}</h3>
            <p>${sec.content}</p>
          `).join('')}
        </div>

        <!-- 商务标 -->
        <div class="section">
          <div class="section-title">第二部分 商务标</div>
          ${(data.commercialBid as any).sections.map((sec: any) => `
            <h3>${sec.title}</h3>
            <p>${sec.content}</p>
          `).join('')}
        </div>

        <!-- 企业信息 -->
        <div class="section">
          <div class="section-title">企业资质信息</div>
          <table class="info-table">
            <tr><th>企业名称</th><td>${data.company.name}</td></tr>
            <tr><th>有效资质</th><td>${(data.company as any).validCertifications.join('、') || '无'}</td></tr>
          </table>
          <h4>所有资质列表：</h4>
          ${(data.company as any).qualifications.map((q: string) => `
            <div class="qualification-item">• ${q}</div>
          `).join('')}
        </div>

        <!-- 签字盖章 -->
        <div class="signature">
          <div class="signature-block">
            <p>投标单位（盖章）：</p>
            <p style="margin-top: 30px;">${data.company.name}</p>
          </div>
          <div class="signature-block">
            <p>法定代表人（签字）：</p>
            <p style="margin-top: 30px;">_________________</p>
          </div>
        </div>

        <div class="footer">
          <p>本文件由智标通标书工厂自动生成 · 仅供参考</p>
          <p> Generated by SmartBid MVP · Page 1</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 构建企业概况
   */
  private buildCompanyProfile(companyInfo: Record<string, unknown>): string {
    const certs = (companyInfo.validCertifications as string[]).filter(c => c.trim());
    return `
      我公司具有相关项目的丰富经验，具备以下有效资质：
      ${certs.length > 0 ? certs.map(c => `- ${c}`).join('\n') : '（暂无有效资质）'}

      公司一贯坚持质量第一、用户至上的原则，严格按照国家法规和标准进行项目管理。
    `;
  }

  /**
   * 构建项目理解
   */
  private buildProjectUnderstanding(): string {
    return `
      针对${this.tender.title}项目，我公司经过认真研究招标文件，理解如下：

      1. 项目背景：${this.tender.industry || ' unspecified '}领域的建设需求
      2. 项目地点：${this.tender.region}
      3. 预算规模：${this.tender.budget} 万元
      4. 工期要求：投标截止 ${this.tender.deadline}

      我们将根据招标要求，制定详细的技术实施方案，确保项目按期保质完成。
    `;
  }

  /**
   * 构建技术方案
   */
  private buildTechnicalSolution(): string {
    return `
      1. 总体架构设计
         - 采用模块化设计，确保系统的可扩展性
         - 满足招标文件中的技术要求

      2. 关键技术路线
         - 选用成熟稳定的技术栈
         - 确保系统的安全性和可靠性

      3. 人员配置
         - 配备具有相关资质的专业技术人员
         - 项目经理具备项目管理经验

      4. 设备与材料
         - 选用符合国家标准的优质产品
         - 主要设备提供原厂质保
    `;
  }

  /**
   * 构建实施计划
   */
  private buildImplementationPlan(): string {
    return `
      1. 准备阶段（1-2周）
         - 组建项目团队
         - 编制详细实施计划
         - 现场勘查

      2. 实施阶段（根据项目规模）
         - 分阶段推进，确保进度可控
         - 每周向业主汇报进展

      3. 验收阶段
         - 按招标要求进行验收测试
         - 提交完整的竣工文档
    `;
  }

  /**
   * 构建质量保证
   */
  private buildQualityAssurance(): string {
    return `
      1. 质量管理体系
         - 通过 ISO9001 质量管理体系认证（如具备）
         - 严格执行三级检查制度

      2. 进度保证措施
         - 制定关键节点计划
         - 配备充足资源

      3. 售后服务
         - 提供 24 小时响应
         - 免费维护期不少于 12 个月
    `;
  }

  /**
   * 构建报价明细
   */
  private buildPriceDetail(): string {
    const total = this.tender.budget;
    const suggestedPrice = total * 0.85; // 示例：85% 报价策略
    const breakdown = {
      "设备费": suggestedPrice * 0.6,
      "材料费": suggestedPrice * 0.2,
      "人工费": suggestedPrice * 0.15,
      "管理费": suggestedPrice * 0.05,
    };

    let result = `项目总报价：¥${suggestedPrice.toFixed(2)} 万元\n\n`;
    result += "报价明细：\n";
    for (const [item, price] of Object.entries(breakdown)) {
      result += `  - ${item}: ¥${price.toFixed(2)} 万元\n`;
    }
    result += `\n备注：报价已包含所有税费、运输费、安装调试费等全部费用。`;
    return result;
  }

  /**
   * 构建商务条款响应
   */
  private buildCommercialResponse(): string {
    return `
      完全响应招标文件中的商务条款要求，包括：

      1. 合同期限：按招标文件规定执行
      2. 付款方式：接受招标文件规定的付款条件
      3. 履约保证金：按招标文件要求缴纳
      4. 质保期：提供不少于 12 个月免费质保
      5. 售后服务：全国范围内 7×24 小时支持
    `;
  }

  /**
   * 构建资格证明文件清单
   */
  private buildQualificationProof(companyInfo: Record<string, unknown>): string {
    const certs = (companyInfo.validCertifications as string[]).filter(c => c.trim());
    let result = "需提供的证明文件：\n";
    result += "1. 企业营业执照副本（加盖公章）\n";
    result += "2. 资质证书复印件（加盖公章）\n";
    result += "3. 企业近三年业绩清单\n";
    result += "4. 项目负责人资格证书\n";
    if (certs.length > 0) {
      result += "\n相关资质：\n";
      certs.forEach(c => result += `- ${c}\n`);
    }
    return result;
  }

  /**
   * 计算技术标得分（示例）
   */
  private calculateTechScore(): number {
    // 基于匹配度和资质数量计算示例分数
    const matchedCount = this.qualifications.filter(q => 
      this.tender.requiredQualifications.some(req => q.name.includes(req))
    ).length;
    return Math.min(100, 60 + matchedCount * 10);
  }

  /**
   * 下载文件
   */
  async download(format: "docx" | "pdf", templatePath?: string): Promise<void> {
    let blob: Blob;
    const filename = `标书_${this.tender.id}_${this.tender.title}_${new Date().toISOString().split('T')[0]}`;

    if (format === "docx") {
      if (!templatePath) {
        throw new Error("DOCX 格式需要提供模板文件路径");
      }
      blob = await this.generateDocx(templatePath);
      this.saveBlob(blob, `${filename}.docx`);
    } else {
      blob = await this.generatePdf();
      this.saveBlob(blob, `${filename}.pdf`);
    }
  }

  /**
   * 保存 Blob 到本地
   */
  private saveBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

/**
 * 便捷函数：创建标书生成器
 */
export function createBidGenerator(tender: Tender, qualifications: Qualification[]) {
  return new BidGenerator(tender, qualifications);
}
