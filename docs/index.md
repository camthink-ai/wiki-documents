import DocumentList from '@site/src/components/DocumentList';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';

# Welcome

欢迎来到 **CamThink Wiki 中心**！

我们很高兴您能加入我们的社区，这里是您了解和探索边缘AI感知技术的最佳场所。无论您是初学者还是有经验的开发者，您都能在这里找到有用的资源和支持。

## CamThink，让边缘智能更具想象力

**CamThink** 是一个专为开发者提供多种**开放硬件**和**开源软件**的品牌，我们致力于构建在现实世界中可广泛应用的**边缘AI感知套件**，我们的重点在于提供视觉、听觉和环境数据等多维感知能力，旨在让AI更全面地理解世界，推动边缘智能技术的普及与发展。作为 Milesight（星纵科技）的子品牌，CamThink 继承了其强大的研发能力和全球支持网络，为产品的可靠性和持续创新提供了有力保障。

## 快速入口
为了帮助您快速上手，这里提供了一些重要的资源链接：
{/* 产品卡片容器 */}
<div className="product-card-container">

  {/* NeoEdge NG4500 系列产品卡片 */}
  <div className="product-card">
    <div className="product-header">
      <img src={useBaseUrl('img/Overview/NG45xx/NG45XX.png')} alt="NeoEdge NG45XX" className="product-image"/>
      <h3 className="product-title">NeoEdge NG4500 AI边缘计算网关</h3>
    </div>
    <p className="product-description">
      基于NVIDIA Jetson平台的高性能边缘计算设备，适用于复杂AI推理和多模态数据处理场景。
    </p>
    <div className="product-links">
      <Link to={useBaseUrl('docs/NeoEdge NG4500 Series/Overview')} className="link-item">
        <span className="link-icon">📖</span>
        <span>产品概述</span>
      </Link>
      <Link to={useBaseUrl('docs/NeoEdge NG4500 Series/Quick Start')} className="link-item">
        <span className="link-icon">🚀</span>
        <span>快速入门</span>
      </Link>
      <Link to={useBaseUrl('docs/NeoEdge NG4500 Series/NG4500-CB01 Development Board/Dev Guide')} className="link-item">
        <span className="link-icon">🔧</span>
        <span>开发指南</span>
      </Link>
      <Link to={useBaseUrl('docs/NeoEdge NG4500 Series/Application Guide/Deepseek-r1')} className="link-item">
        <span className="link-icon">📱</span>
        <span>应用指南</span>
      </Link>
    </div>
  </div>

  {/* NeoEyes NE101 系列产品卡片 */}
  <div className="product-card">
    <div className="product-header">
      <img src={useBaseUrl('img/Overview/NE101/NE101.png')} alt="NeoEyes NE101" className="product-image"/>
      <h3 className="product-title">NeoEyes NE101 低功耗相机</h3>
    </div>
    <p className="product-description">
      轻量级智能摄像设备，支持边缘视觉分析和无线连接，适用于IoT和轻量级AI应用场景。
    </p>
    <div className="product-links">
      <Link to={useBaseUrl('docs/NeoEyes NE101 Series/Overview')} className="link-item">
        <span className="link-icon">📖</span>
        <span>产品概述</span>
      </Link>
      <Link to={useBaseUrl('docs/NeoEyes NE101 Series/Quick Start')} className="link-item">
        <span className="link-icon">🚀</span>
        <span>快速入门</span>
      </Link>
      <Link to={useBaseUrl('docs/NeoEyes NE101 Series/NE100-MB01 Development Board/Dev Guide')} className="link-item">
        <span className="link-icon">🔧</span>
        <span>开发指南</span>
      </Link>
      <Link to={useBaseUrl('docs/NeoEyes NE101 Series/Application Guide/low-power-image-acquisition')} className="link-item">
        <span className="link-icon">📱</span>
        <span>应用指南</span>
      </Link>
    </div>
  </div>

</div>

{/* 产品卡片样式 */}
<style>
{`
  .product-card-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 48px;
  }
  
  .product-card {
    border: 1px solid var(--ifm-border-color);
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
  
  .product-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    gap: 16px;
  }
  
  .product-image {
    width: 150px;
    height: 150px;
    object-fit: contain;
    border-radius: 8px;
    padding: 8px;
  }
  
  .product-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }
  
  .product-description {
    margin: 0 0 16px 0;
    line-height: 1.5;
  }
  
  .product-links {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .link-item {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border-radius: 6px;
    text-decoration: none;
    transition: background-color 0.2s ease;
  }
  
  .link-item:hover {
    background-color: var(--ifm-hover-overlay);
  }
  
  .link-icon {
    margin-right: 10px;
    font-size: 18px;
  }
  
  @media (max-width: 768px) {
    .product-card-container {
      grid-template-columns: 1fr;
    }
  }
`}
</style>