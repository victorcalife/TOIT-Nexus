/**
 * DASHBOARD BUILDER - NO-CODE TOIT NEXUS
 * Construtor visual de dashboards com drag & drop
 */

import React, { useState, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Drawer, 
  Form, 
  Input, 
  Select, 
  ColorPicker, 
  Slider,
  Switch,
  Modal,
  message,
  Space,
  Tabs,
  Row,
  Col,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EyeOutlined, 
  SaveOutlined, 
  SettingOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  TableOutlined,
  NumberOutlined,
  ExperimentOutlined,
  DragOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './DashboardBuilder.css';

const ResponsiveGridLayout = WidthProvider(Responsive);
const { Option } = Select;
const { TabPane } = Tabs;

// Tipos de widgets disponíveis
const widgetTypes = {
  chart: {
    label: 'Chart',
    icon: <BarChartOutlined />,
    color: '#1890ff',
    subtypes: ['bar', 'line', 'pie', 'area', 'scatter']
  },
  table: {
    label: 'Table',
    icon: <TableOutlined />,
    color: '#52c41a',
    subtypes: ['basic', 'advanced', 'editable']
  },
  metric: {
    label: 'Metric',
    icon: <NumberOutlined />,
    color: '#faad14',
    subtypes: ['single', 'comparison', 'progress']
  },
  text: {
    label: 'Text',
    icon: <PlusOutlined />,
    color: '#722ed1',
    subtypes: ['title', 'paragraph', 'markdown']
  },
  quantum: {
    label: 'Quantum Widget',
    icon: <ExperimentOutlined />,
    color: '#eb2f96',
    subtypes: ['prediction', 'optimization', 'analysis']
  }
};

// Fontes de dados disponíveis
const dataSources = [
  { id: 'database', name: 'Database Query', type: 'sql' },
  { id: 'api', name: 'REST API', type: 'http' },
  { id: 'file', name: 'File Upload', type: 'file' },
  { id: 'realtime', name: 'Real-time Stream', type: 'websocket' },
  { id: 'quantum', name: 'Quantum Analysis', type: 'quantum' }
];

const DashboardBuilder = ({ dashboardId, onSave, onPreview }) => {
  const [widgets, setWidgets] = useState([]);
  const [layouts, setLayouts] = useState({});
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [dashboardConfig, setDashboardConfig] = useState({
    name: 'New Dashboard',
    description: '',
    theme: 'light',
    quantumOptimized: true,
    autoRefresh: true,
    refreshInterval: 30
  });

  const [form] = Form.useForm();

  // Adicionar widget
  const addWidget = (type, subtype = null) => {
    const newWidget = {
      i: `widget_${Date.now()}`,
      type: type,
      subtype: subtype,
      title: `${widgetTypes[type].label} ${widgets.length + 1}`,
      config: {
        dataSource: null,
        query: '',
        options: {},
        style: {
          backgroundColor: '#ffffff',
          borderColor: '#d9d9d9',
          borderRadius: 6
        },
        quantumOptimized: type === 'quantum'
      },
      x: 0,
      y: 0,
      w: type === 'metric' ? 3 : 6,
      h: type === 'metric' ? 2 : 4,
      minW: 2,
      minH: 2
    };

    setWidgets([...widgets, newWidget]);
    setSelectedWidget(newWidget);
    setDrawerVisible(true);
  };

  // Selecionar widget
  const selectWidget = (widgetId) => {
    const widget = widgets.find(w => w.i === widgetId);
    setSelectedWidget(widget);
    setDrawerVisible(true);
  };

  // Remover widget
  const removeWidget = (widgetId) => {
    setWidgets(widgets.filter(w => w.i !== widgetId));
    if (selectedWidget?.i === widgetId) {
      setSelectedWidget(null);
      setDrawerVisible(false);
    }
  };

  // Salvar configuração do widget
  const saveWidgetConfig = (config) => {
    if (!selectedWidget) return;

    setWidgets(widgets.map(widget =>
      widget.i === selectedWidget.i
        ? { ...widget, ...config }
        : widget
    ));

    setDrawerVisible(false);
    message.success('Widget configuration saved');
  };

  // Atualizar layout
  const onLayoutChange = (layout, layouts) => {
    setLayouts(layouts);
    
    // Atualizar posições dos widgets
    setWidgets(widgets.map(widget => {
      const layoutItem = layout.find(l => l.i === widget.i);
      return layoutItem ? { ...widget, ...layoutItem } : widget;
    }));
  };

  // Salvar dashboard
  const saveDashboard = async () => {
    try {
      const dashboard = {
        id: dashboardId || `dashboard_${Date.now()}`,
        name: dashboardConfig.name,
        description: dashboardConfig.description,
        widgets: widgets,
        layouts: layouts,
        config: dashboardConfig,
        version: '1.0.0',
        createdAt: new Date().toISOString()
      };

      if (onSave) {
        await onSave(dashboard);
      }

      message.success('Dashboard saved successfully');
    } catch (error) {
      message.error('Failed to save dashboard: ' + error.message);
    }
  };

  // Preview dashboard
  const previewDashboard = () => {
    const dashboard = {
      widgets: widgets,
      layouts: layouts,
      config: dashboardConfig
    };

    if (onPreview) {
      onPreview(dashboard);
    }
  };

  // Renderizar painel de widgets
  const renderWidgetPanel = () => (
    <Card title="📊 Dashboard Widgets" className="widget-panel">
      <Tabs defaultActiveKey="basic" size="small">
        <TabPane tab="Basic" key="basic">
          <div className="widget-categories">
            {Object.entries(widgetTypes).map(([type, config]) => (
              <div key={type} className="widget-category">
                <Button
                  block
                  className="widget-button"
                  style={{ borderColor: config.color, color: config.color }}
                  onClick={() => addWidget(type)}
                  icon={config.icon}
                >
                  {config.label}
                </Button>
                
                {config.subtypes && (
                  <div className="widget-subtypes">
                    {config.subtypes.map(subtype => (
                      <Button
                        key={subtype}
                        size="small"
                        type="text"
                        onClick={() => addWidget(type, subtype)}
                      >
                        {subtype}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabPane>

        <TabPane tab="Quantum" key="quantum">
          <div className="quantum-widgets">
            <Button
              block
              className="quantum-widget-button"
              onClick={() => addWidget('quantum', 'prediction')}
              icon={<ExperimentOutlined />}
            >
              🔮 Quantum Prediction
            </Button>
            <Button
              block
              className="quantum-widget-button"
              onClick={() => addWidget('quantum', 'optimization')}
              icon={<ExperimentOutlined />}
            >
              ⚡ Quantum Optimization
            </Button>
            <Button
              block
              className="quantum-widget-button"
              onClick={() => addWidget('quantum', 'analysis')}
              icon={<ExperimentOutlined />}
            >
              🧠 Quantum Analysis
            </Button>
          </div>
        </TabPane>

        <TabPane tab="Templates" key="templates">
          <div className="widget-templates">
            <Button block onClick={() => addPrebuiltDashboard('sales')}>
              📈 Sales Dashboard
            </Button>
            <Button block onClick={() => addPrebuiltDashboard('analytics')}>
              📊 Analytics Dashboard
            </Button>
            <Button block onClick={() => addPrebuiltDashboard('quantum')}>
              ⚛️ Quantum Dashboard
            </Button>
          </div>
        </TabPane>
      </Tabs>
    </Card>
  );

  // Renderizar widget no grid
  const renderWidget = (widget) => (
    <div key={widget.i} className="dashboard-widget">
      <div className="widget-header">
        <span className="widget-title">{widget.title}</span>
        <div className="widget-actions">
          <Tooltip title="Configure">
            <Button
              size="small"
              type="text"
              icon={<SettingOutlined />}
              onClick={() => selectWidget(widget.i)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeWidget(widget.i)}
            />
          </Tooltip>
        </div>
      </div>
      
      <div className="widget-content">
        {renderWidgetContent(widget)}
      </div>
    </div>
  );

  // Renderizar conteúdo do widget
  const renderWidgetContent = (widget) => {
    switch (widget.type) {
      case 'chart':
        return (
          <div className="widget-placeholder chart-placeholder">
            {widget.subtype ? (
              <>
                {widget.subtype === 'bar' && <BarChartOutlined />}
                {widget.subtype === 'line' && <LineChartOutlined />}
                {widget.subtype === 'pie' && <PieChartOutlined />}
              </>
            ) : (
              <BarChartOutlined />
            )}
            <p>{widget.subtype || 'Chart'} Widget</p>
          </div>
        );
      
      case 'table':
        return (
          <div className="widget-placeholder table-placeholder">
            <TableOutlined />
            <p>Table Widget</p>
          </div>
        );
      
      case 'metric':
        return (
          <div className="widget-placeholder metric-placeholder">
            <NumberOutlined />
            <div className="metric-value">1,234</div>
            <div className="metric-label">Sample Metric</div>
          </div>
        );
      
      case 'quantum':
        return (
          <div className="widget-placeholder quantum-placeholder">
            <ExperimentOutlined />
            <p>⚛️ Quantum {widget.subtype || 'Widget'}</p>
            <div className="quantum-status">Optimizing...</div>
          </div>
        );
      
      default:
        return (
          <div className="widget-placeholder">
            <PlusOutlined />
            <p>Widget Content</p>
          </div>
        );
    }
  };

  // Renderizar configuração do widget
  const renderWidgetConfig = () => {
    if (!selectedWidget) return null;

    return (
      <Form
        form={form}
        layout="vertical"
        initialValues={selectedWidget}
        onFinish={saveWidgetConfig}
      >
        <Form.Item
          name="title"
          label="Widget Title"
          rules={[{ required: true, message: 'Please enter widget title' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Tabs defaultActiveKey="data" size="small">
          <TabPane tab="Data" key="data">
            <Form.Item name={['config', 'dataSource']} label="Data Source">
              <Select placeholder="Select data source">
                {dataSources.map(source => (
                  <Option key={source.id} value={source.id}>
                    {source.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name={['config', 'query']} label="Query/URL">
              <Input.TextArea 
                rows={3} 
                placeholder="SELECT * FROM table WHERE..." 
              />
            </Form.Item>

            {selectedWidget.type === 'quantum' && (
              <Form.Item name={['config', 'quantumAlgorithm']} label="Quantum Algorithm">
                <Select placeholder="Select quantum algorithm">
                  <Option value="qaoa">QAOA Optimization</Option>
                  <Option value="grover">Grover Search</Option>
                  <Option value="portfolio">Portfolio Analysis</Option>
                </Select>
              </Form.Item>
            )}
          </TabPane>

          <TabPane tab="Style" key="style">
            <Form.Item name={['config', 'style', 'backgroundColor']} label="Background Color">
              <ColorPicker />
            </Form.Item>

            <Form.Item name={['config', 'style', 'borderRadius']} label="Border Radius">
              <Slider min={0} max={20} />
            </Form.Item>

            {selectedWidget.type === 'chart' && (
              <>
                <Form.Item name={['config', 'chartType']} label="Chart Type">
                  <Select>
                    <Option value="bar">Bar Chart</Option>
                    <Option value="line">Line Chart</Option>
                    <Option value="pie">Pie Chart</Option>
                    <Option value="area">Area Chart</Option>
                  </Select>
                </Form.Item>

                <Form.Item name={['config', 'showLegend']} valuePropName="checked">
                  <Switch checkedChildren="Legend ON" unCheckedChildren="Legend OFF" />
                </Form.Item>
              </>
            )}
          </TabPane>

          <TabPane tab="Options" key="options">
            <Form.Item name={['config', 'autoRefresh']} valuePropName="checked">
              <Switch checkedChildren="Auto-refresh ON" unCheckedChildren="Auto-refresh OFF" />
            </Form.Item>

            <Form.Item name={['config', 'refreshInterval']} label="Refresh Interval (seconds)">
              <Input type="number" min={5} max={3600} />
            </Form.Item>

            <Form.Item name={['config', 'quantumOptimized']} valuePropName="checked">
              <Switch 
                checkedChildren="⚛️ Quantum ON" 
                unCheckedChildren="Quantum OFF" 
              />
            </Form.Item>
          </TabPane>
        </Tabs>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Save Widget
            </Button>
            <Button onClick={() => setDrawerVisible(false)}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    );
  };

  // Adicionar dashboard pré-construído
  const addPrebuiltDashboard = (type) => {
    let prebuiltWidgets = [];

    switch (type) {
      case 'sales':
        prebuiltWidgets = [
          { ...createWidget('metric', 'single', 'Total Sales', 0, 0, 3, 2) },
          { ...createWidget('metric', 'single', 'New Customers', 3, 0, 3, 2) },
          { ...createWidget('chart', 'line', 'Sales Trend', 0, 2, 6, 4) },
          { ...createWidget('table', 'basic', 'Top Products', 6, 0, 6, 6) }
        ];
        break;
      
      case 'analytics':
        prebuiltWidgets = [
          { ...createWidget('chart', 'bar', 'Page Views', 0, 0, 6, 4) },
          { ...createWidget('chart', 'pie', 'Traffic Sources', 6, 0, 6, 4) },
          { ...createWidget('metric', 'comparison', 'Conversion Rate', 0, 4, 4, 2) },
          { ...createWidget('metric', 'progress', 'Goal Progress', 4, 4, 4, 2) }
        ];
        break;
      
      case 'quantum':
        prebuiltWidgets = [
          { ...createWidget('quantum', 'prediction', 'Quantum Predictions', 0, 0, 6, 4) },
          { ...createWidget('quantum', 'optimization', 'System Optimization', 6, 0, 6, 4) },
          { ...createWidget('metric', 'single', 'Quantum Coherence', 0, 4, 3, 2) },
          { ...createWidget('metric', 'single', 'Speedup Factor', 3, 4, 3, 2) }
        ];
        break;
    }

    setWidgets([...widgets, ...prebuiltWidgets]);
    message.success(`${type} dashboard template added`);
  };

  // Criar widget helper
  const createWidget = (type, subtype, title, x, y, w, h) => ({
    i: `widget_${Date.now()}_${Math.random()}`,
    type,
    subtype,
    title,
    x, y, w, h,
    minW: 2,
    minH: 2,
    config: {
      dataSource: null,
      query: '',
      quantumOptimized: type === 'quantum'
    }
  });

  return (
    <div className="dashboard-builder">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h2>📊 Dashboard Builder</h2>
          <span className="dashboard-subtitle">
            {dashboardConfig.name} {dashboardConfig.quantumOptimized && '⚛️'}
          </span>
        </div>
        
        <div className="dashboard-actions">
          <Space>
            <Button
              icon={<SettingOutlined />}
              onClick={() => setConfigModalVisible(true)}
            >
              Settings
            </Button>
            <Button
              icon={<EyeOutlined />}
              onClick={previewDashboard}
              disabled={widgets.length === 0}
            >
              Preview
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={saveDashboard}
              disabled={widgets.length === 0}
            >
              Save
            </Button>
          </Space>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-sidebar">
          {renderWidgetPanel()}
        </div>

        <div className="dashboard-canvas">
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            onLayoutChange={onLayoutChange}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={60}
            margin={[16, 16]}
          >
            {widgets.map(renderWidget)}
          </ResponsiveGridLayout>
        </div>
      </div>

      {/* Drawer de configuração do widget */}
      <Drawer
        title={`Configure ${selectedWidget?.title || 'Widget'}`}
        placement="right"
        width={400}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {renderWidgetConfig()}
      </Drawer>

      {/* Modal de configuração do dashboard */}
      <Modal
        title="Dashboard Settings"
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          initialValues={dashboardConfig}
          onFinish={(values) => {
            setDashboardConfig(values);
            setConfigModalVisible(false);
            message.success('Dashboard settings updated');
          }}
        >
          <Form.Item
            name="name"
            label="Dashboard Name"
            rules={[{ required: true, message: 'Please enter dashboard name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="theme" label="Theme">
            <Select>
              <Option value="light">Light</Option>
              <Option value="dark">Dark</Option>
              <Option value="quantum">Quantum</Option>
            </Select>
          </Form.Item>

          <Form.Item name="quantumOptimized" valuePropName="checked">
            <Switch 
              checkedChildren="⚛️ Quantum ON" 
              unCheckedChildren="Quantum OFF" 
            />
          </Form.Item>

          <Form.Item name="autoRefresh" valuePropName="checked">
            <Switch 
              checkedChildren="Auto-refresh ON" 
              unCheckedChildren="Auto-refresh OFF" 
            />
          </Form.Item>

          <Form.Item name="refreshInterval" label="Refresh Interval (seconds)">
            <Input type="number" min={5} max={3600} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Save Settings
              </Button>
              <Button onClick={() => setConfigModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DashboardBuilder;
