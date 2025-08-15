/**
 * NO-CODE STUDIO - TOIT NEXUS
 * Estúdio principal para todas as funcionalidades no-code
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tabs, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch,
  message,
  Space,
  Row,
  Col,
  Statistic,
  Progress,
  Tag,
  List,
  Avatar
} from 'antd';
import { 
  PlusOutlined,
  BranchesOutlined,
  DashboardOutlined,
  FormOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  RocketOutlined,
  SaveOutlined,
  EyeOutlined,
  SettingOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import WorkflowBuilder from './WorkflowBuilder';
import DashboardBuilder from './DashboardBuilder';
import FormBuilder from './FormBuilder';
import ReportBuilder from './ReportBuilder';
import useQuantumSystem from '../../hooks/useQuantumSystem';
import './NoCodeBuilder.css';

const { TabPane } = Tabs;
const { Option } = Select;

const NoCodeStudio = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [studioStats, setStudioStats] = useState({
    totalProjects: 0,
    activeWorkflows: 0,
    dashboards: 0,
    forms: 0,
    reports: 0,
    quantumOptimized: 0
  });

  const { 
    quantumStatus, 
    processQuantumOperation, 
    loading 
  } = useQuantumSystem();

  const [form] = Form.useForm();

  // Carregar projetos
  useEffect(() => {
    loadProjects();
    loadStudioStats();
  }, []);

  const loadProjects = async () => {
    // Simular carregamento de projetos
    const mockProjects = [
      {
        id: 1,
        name: 'Sales Dashboard',
        type: 'dashboard',
        status: 'active',
        quantumOptimized: true,
        lastModified: '2024-01-15T10:30:00Z',
        performance: 95
      },
      {
        id: 2,
        name: 'Approval Workflow',
        type: 'workflow',
        status: 'active',
        quantumOptimized: true,
        lastModified: '2024-01-14T15:45:00Z',
        performance: 88
      },
      {
        id: 3,
        name: 'Customer Survey',
        type: 'form',
        status: 'draft',
        quantumOptimized: false,
        lastModified: '2024-01-13T09:20:00Z',
        performance: 72
      }
    ];

    setProjects(mockProjects);
  };

  const loadStudioStats = async () => {
    // Simular estatísticas do estúdio
    setStudioStats({
      totalProjects: 12,
      activeWorkflows: 5,
      dashboards: 3,
      forms: 2,
      reports: 2,
      quantumOptimized: 8
    });
  };

  // Criar novo projeto
  const createProject = async (values) => {
    try {
      const newProject = {
        id: Date.now(),
        name: values.name,
        type: values.type,
        description: values.description,
        quantumOptimized: values.quantumOptimized,
        status: 'draft',
        createdAt: new Date().toISOString(),
        performance: 0
      };

      setProjects([...projects, newProject]);
      setCreateModalVisible(false);
      form.resetFields();
      
      // Abrir o construtor apropriado
      setSelectedProject(newProject);
      setActiveTab(values.type);
      
      message.success('Project created successfully');

    } catch (error) {
      message.error('Failed to create project: ' + error.message);
    }
  };

  // Salvar projeto
  const saveProject = async (projectData) => {
    try {
      // Aplicar otimização quântica se habilitada
      if (projectData.quantumOptimized) {
        const operation = {
          type: 'nocode_project',
          action: 'save'
        };

        const result = await processQuantumOperation(operation, projectData);
        projectData.quantumMetrics = result.quantumMetrics;
        projectData.performance = Math.round(result.quantumMetrics.quantumEfficiency * 100);
      }

      // Atualizar projeto na lista
      setProjects(projects.map(p => 
        p.id === projectData.id ? { ...p, ...projectData } : p
      ));

      message.success('Project saved successfully');
    } catch (error) {
      message.error('Failed to save project: ' + error.message);
    }
  };

  // Preview projeto
  const previewProject = (projectData) => {
    message.info('Opening project preview...');
    // Implementar preview
  };

  // Renderizar overview
  const renderOverview = () => (
    <div className="nocode-overview">
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Projects"
              value={studioStats.totalProjects}
              prefix={<RocketOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Workflows"
              value={studioStats.activeWorkflows}
              prefix={<BranchesOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Dashboards"
              value={studioStats.dashboards}
              prefix={<DashboardOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Quantum Optimized"
              value={studioStats.quantumOptimized}
              prefix={<ExperimentOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Recent Projects" className="recent-projects">
            <List
              itemLayout="horizontal"
              dataSource={projects.slice(0, 5)}
              renderItem={project => (
                <List.Item
                  actions={[
                    <Button 
                      type="text" 
                      icon={<EyeOutlined />}
                      onClick={() => previewProject(project)}
                    >
                      Preview
                    </Button>,
                    <Button 
                      type="text" 
                      icon={<SettingOutlined />}
                      onClick={() => {
                        setSelectedProject(project);
                        setActiveTab(project.type);
                      }}
                    >
                      Edit
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={getProjectIcon(project.type)} 
                        style={{ backgroundColor: getProjectColor(project.type) }}
                      />
                    }
                    title={
                      <Space>
                        {project.name}
                        {project.quantumOptimized && (
                          <Tag color="purple" size="small">⚛️ Quantum</Tag>
                        )}
                        <Tag color={project.status === 'active' ? 'green' : 'orange'}>
                          {project.status}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        <span>Type: {project.type}</span>
                        <Progress 
                          percent={project.performance} 
                          size="small" 
                          status={project.performance > 80 ? 'success' : 'normal'}
                        />
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="⚛️ Quantum System Status" className="quantum-status">
            {quantumStatus ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <span>System Coherence:</span>
                  <Progress 
                    percent={Math.round(quantumStatus.systemCoherence * 100)} 
                    size="small"
                    status="success"
                  />
                </div>
                <div>
                  <span>Network Entanglement:</span>
                  <Progress 
                    percent={Math.round(quantumStatus.networkEntanglement * 100)} 
                    size="small"
                    strokeColor="#722ed1"
                  />
                </div>
                <div>
                  <span>Active Qubits:</span>
                  <Tag color="purple">{quantumStatus.quantumCore?.qubits || 64}</Tag>
                </div>
                <div>
                  <span>Algorithms:</span>
                  <div style={{ marginTop: 8 }}>
                    {Object.entries(quantumStatus.algorithms || {}).map(([name, status]) => (
                      <Tag 
                        key={name} 
                        color={status === 'active' ? 'green' : 'default'}
                        size="small"
                      >
                        {name}
                      </Tag>
                    ))}
                  </div>
                </div>
              </Space>
            ) : (
              <div style={{ textAlign: 'center', color: '#999' }}>
                Loading quantum system status...
              </div>
            )}
          </Card>

          <Card title="Quick Actions" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                block 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setCreateModalVisible(true)}
              >
                Create New Project
              </Button>
              <Button 
                block 
                icon={<BranchesOutlined />}
                onClick={() => {
                  setCreateModalVisible(true);
                  form.setFieldsValue({ type: 'workflow' });
                }}
              >
                New Workflow
              </Button>
              <Button 
                block 
                icon={<DashboardOutlined />}
                onClick={() => {
                  setCreateModalVisible(true);
                  form.setFieldsValue({ type: 'dashboard' });
                }}
              >
                New Dashboard
              </Button>
              <Button 
                block 
                icon={<FormOutlined />}
                onClick={() => {
                  setCreateModalVisible(true);
                  form.setFieldsValue({ type: 'form' });
                }}
              >
                New Form
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Obter ícone do projeto
  const getProjectIcon = (type) => {
    switch (type) {
      case 'workflow': return <BranchesOutlined />;
      case 'dashboard': return <DashboardOutlined />;
      case 'form': return <FormOutlined />;
      case 'report': return <FileTextOutlined />;
      default: return <RocketOutlined />;
    }
  };

  // Obter cor do projeto
  const getProjectColor = (type) => {
    switch (type) {
      case 'workflow': return '#52c41a';
      case 'dashboard': return '#1890ff';
      case 'form': return '#faad14';
      case 'report': return '#722ed1';
      default: return '#666';
    }
  };

  return (
    <div className="nocode-studio">
      <div className="studio-header">
        <div className="studio-title">
          <h1>🎨 No-Code Studio</h1>
          <p>Build powerful applications without coding</p>
        </div>
        
        <div className="studio-actions">
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              New Project
            </Button>
            <Button 
              icon={<ExperimentOutlined />}
              style={{ 
                background: 'linear-gradient(45deg, #722ed1, #eb2f96)',
                borderColor: '#722ed1',
                color: 'white'
              }}
            >
              ⚛️ Quantum Mode
            </Button>
          </Space>
        </div>
      </div>

      <div className="studio-content">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          type="card"
          size="large"
        >
          <TabPane 
            tab={
              <span>
                <RocketOutlined />
                Overview
              </span>
            } 
            key="overview"
          >
            {renderOverview()}
          </TabPane>

          <TabPane 
            tab={
              <span>
                <BranchesOutlined />
                Workflow Builder
              </span>
            } 
            key="workflow"
          >
            <WorkflowBuilder
              workflowId={selectedProject?.id}
              onSave={saveProject}
              onTest={previewProject}
            />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <DashboardOutlined />
                Dashboard Builder
              </span>
            } 
            key="dashboard"
          >
            <DashboardBuilder
              dashboardId={selectedProject?.id}
              onSave={saveProject}
              onPreview={previewProject}
            />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <FormOutlined />
                Form Builder
              </span>
            } 
            key="form"
          >
            <FormBuilder
              formId={selectedProject?.id}
              onSave={saveProject}
              onPreview={previewProject}
            />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <FileTextOutlined />
                Report Builder
              </span>
            } 
            key="report"
          >
            <ReportBuilder
              reportId={selectedProject?.id}
              onSave={saveProject}
              onPreview={previewProject}
            />
          </TabPane>
        </Tabs>
      </div>

      {/* Modal de criação de projeto */}
      <Modal
        title="Create New Project"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={createProject}
          initialValues={{
            quantumOptimized: true
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Project Name"
                rules={[{ required: true, message: 'Please enter project name' }]}
              >
                <Input placeholder="My Awesome Project" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Project Type"
                rules={[{ required: true, message: 'Please select project type' }]}
              >
                <Select placeholder="Select project type">
                  <Option value="workflow">
                    <BranchesOutlined /> Workflow
                  </Option>
                  <Option value="dashboard">
                    <DashboardOutlined /> Dashboard
                  </Option>
                  <Option value="form">
                    <FormOutlined /> Form
                  </Option>
                  <Option value="report">
                    <FileTextOutlined /> Report
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Describe your project..." 
            />
          </Form.Item>

          <Form.Item name="quantumOptimized" valuePropName="checked">
            <Switch 
              checkedChildren="⚛️ Quantum ON" 
              unCheckedChildren="Quantum OFF" 
            />
            <span style={{ marginLeft: 8, color: '#666' }}>
              Enable quantum optimization for enhanced performance
            </span>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
                icon={<RocketOutlined />}
              >
                Create Project
              </Button>
              <Button onClick={() => {
                setCreateModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NoCodeStudio;
