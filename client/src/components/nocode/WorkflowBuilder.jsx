/**
 * WORKFLOW BUILDER - NO-CODE TOIT NEXUS
 * Construtor visual de workflows com drag & drop
 */

import React, { useState, useCallback, useRef } from 'react';
import { 
  Card, 
  Button, 
  Drawer, 
  Tree, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Modal,
  message,
  Tooltip,
  Space,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  PlayCircleOutlined, 
  SaveOutlined, 
  SettingOutlined,
  BranchesOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  DragOutlined
} from '@ant-design/icons';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import './WorkflowBuilder.css';

const { Option } = Select;

// Tipos de nós disponíveis
const nodeTypes = {
  trigger: {
    label: 'Trigger',
    icon: <PlayCircleOutlined />,
    color: '#52c41a',
    category: 'start'
  },
  action: {
    label: 'Action',
    icon: <ThunderboltOutlined />,
    color: '#1890ff',
    category: 'process'
  },
  condition: {
    label: 'Condition',
    icon: <BranchesOutlined />,
    color: '#faad14',
    category: 'logic'
  },
  quantum: {
    label: 'Quantum Process',
    icon: <ExperimentOutlined />,
    color: '#722ed1',
    category: 'advanced'
  }
};

// Ações disponíveis
const availableActions = [
  { id: 'sendEmail', name: 'Send Email', category: 'Communication' },
  { id: 'createRecord', name: 'Create Record', category: 'Database' },
  { id: 'updateRecord', name: 'Update Record', category: 'Database' },
  { id: 'runQuery', name: 'Run Query', category: 'Database' },
  { id: 'generateReport', name: 'Generate Report', category: 'Reporting' },
  { id: 'callAPI', name: 'Call API', category: 'Integration' },
  { id: 'processData', name: 'Process Data', category: 'Data' },
  { id: 'quantumOptimize', name: 'Quantum Optimize', category: 'AI' },
  { id: 'sendNotification', name: 'Send Notification', category: 'Communication' },
  { id: 'scheduleTask', name: 'Schedule Task', category: 'Automation' }
];

// Triggers disponíveis
const availableTriggers = [
  { id: 'manual', name: 'Manual Trigger', description: 'Start manually' },
  { id: 'schedule', name: 'Schedule', description: 'Time-based trigger' },
  { id: 'webhook', name: 'Webhook', description: 'HTTP endpoint trigger' },
  { id: 'dataChange', name: 'Data Change', description: 'Database change trigger' },
  { id: 'fileUpload', name: 'File Upload', description: 'File upload trigger' },
  { id: 'userAction', name: 'User Action', description: 'User interaction trigger' }
];

const WorkflowBuilder = ({ workflowId, onSave, onTest }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [workflowConfig, setWorkflowConfig] = useState({
    name: 'New Workflow',
    description: '',
    quantumOptimized: true,
    autoSave: true
  });
  
  const reactFlowWrapper = useRef(null);
  const [form] = Form.useForm();

  // Conectar nós
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#1890ff', strokeWidth: 2 }
    }, eds));
  }, [setEdges]);

  // Adicionar novo nó
  const addNode = (type, actionId = null) => {
    const newNode = {
      id: `${type}_${Date.now()}`,
      type: 'default',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: {
        label: nodeTypes[type].label,
        type: type,
        actionId: actionId,
        config: {},
        quantumOptimized: type === 'quantum'
      },
      style: {
        background: nodeTypes[type].color,
        color: 'white',
        border: '2px solid #fff',
        borderRadius: '8px',
        padding: '10px',
        minWidth: '120px',
        textAlign: 'center'
      }
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode);
    setDrawerVisible(true);
  };

  // Selecionar nó
  const onNodeClick = (event, node) => {
    setSelectedNode(node);
    setDrawerVisible(true);
  };

  // Salvar configuração do nó
  const saveNodeConfig = (config) => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                config: config,
                label: config.name || node.data.label
              }
            }
          : node
      )
    );

    setDrawerVisible(false);
    message.success('Node configuration saved');
  };

  // Salvar workflow
  const saveWorkflow = async () => {
    try {
      const workflow = {
        id: workflowId || `workflow_${Date.now()}`,
        name: workflowConfig.name,
        description: workflowConfig.description,
        nodes: nodes,
        edges: edges,
        quantumOptimized: workflowConfig.quantumOptimized,
        version: '1.0.0',
        createdAt: new Date().toISOString()
      };

      if (onSave) {
        await onSave(workflow);
      }

      message.success('Workflow saved successfully');
    } catch (error) {
      message.error('Failed to save workflow: ' + error.message);
    }
  };

  // Testar workflow
  const testWorkflow = async () => {
    try {
      const workflow = {
        nodes: nodes,
        edges: edges,
        quantumOptimized: workflowConfig.quantumOptimized
      };

      if (onTest) {
        await onTest(workflow);
      }

      message.success('Workflow test started');
    } catch (error) {
      message.error('Failed to test workflow: ' + error.message);
    }
  };

  // Renderizar painel de ferramentas
  const renderToolPanel = () => (
    <Card title="🛠️ Workflow Tools" className="tool-panel">
      <div className="tool-categories">
        <div className="tool-category">
          <h4>🚀 Triggers</h4>
          {availableTriggers.map(trigger => (
            <Button
              key={trigger.id}
              block
              className="tool-button"
              onClick={() => addNode('trigger', trigger.id)}
              icon={<PlayCircleOutlined />}
            >
              {trigger.name}
            </Button>
          ))}
        </div>

        <Divider />

        <div className="tool-category">
          <h4>⚡ Actions</h4>
          {availableActions.map(action => (
            <Button
              key={action.id}
              block
              className="tool-button"
              onClick={() => addNode('action', action.id)}
              icon={<ThunderboltOutlined />}
            >
              {action.name}
            </Button>
          ))}
        </div>

        <Divider />

        <div className="tool-category">
          <h4>🔀 Logic</h4>
          <Button
            block
            className="tool-button"
            onClick={() => addNode('condition')}
            icon={<BranchesOutlined />}
          >
            If/Then/Else
          </Button>
          <Button
            block
            className="tool-button"
            onClick={() => addNode('condition')}
            icon={<BranchesOutlined />}
          >
            Switch/Case
          </Button>
        </div>

        <Divider />

        <div className="tool-category">
          <h4>🔬 Quantum AI</h4>
          <Button
            block
            className="tool-button quantum-button"
            onClick={() => addNode('quantum')}
            icon={<ExperimentOutlined />}
          >
            Quantum Optimize
          </Button>
          <Button
            block
            className="tool-button quantum-button"
            onClick={() => addNode('quantum')}
            icon={<ExperimentOutlined />}
          >
            AI Prediction
          </Button>
        </div>
      </div>
    </Card>
  );

  // Renderizar configuração do nó
  const renderNodeConfig = () => {
    if (!selectedNode) return null;

    const nodeData = selectedNode.data;

    return (
      <Form
        form={form}
        layout="vertical"
        initialValues={nodeData.config}
        onFinish={saveNodeConfig}
      >
        <Form.Item
          name="name"
          label="Node Name"
          rules={[{ required: true, message: 'Please enter node name' }]}
        >
          <Input placeholder="Enter node name" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Enter description" />
        </Form.Item>

        {nodeData.type === 'trigger' && (
          <>
            <Form.Item name="triggerType" label="Trigger Type">
              <Select placeholder="Select trigger type">
                {availableTriggers.map(trigger => (
                  <Option key={trigger.id} value={trigger.id}>
                    {trigger.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {nodeData.actionId === 'schedule' && (
              <Form.Item name="schedule" label="Schedule">
                <Input placeholder="0 9 * * 1-5 (Every weekday at 9 AM)" />
              </Form.Item>
            )}
          </>
        )}

        {nodeData.type === 'action' && (
          <>
            <Form.Item name="actionType" label="Action Type">
              <Select placeholder="Select action type">
                {availableActions.map(action => (
                  <Option key={action.id} value={action.id}>
                    {action.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="parameters" label="Parameters">
              <Input.TextArea 
                rows={4} 
                placeholder='{"key": "value"}' 
              />
            </Form.Item>
          </>
        )}

        {nodeData.type === 'condition' && (
          <>
            <Form.Item name="conditionType" label="Condition Type">
              <Select placeholder="Select condition">
                <Option value="equals">Equals</Option>
                <Option value="contains">Contains</Option>
                <Option value="greaterThan">Greater Than</Option>
                <Option value="lessThan">Less Than</Option>
                <Option value="isEmpty">Is Empty</Option>
              </Select>
            </Form.Item>

            <Form.Item name="leftValue" label="Left Value">
              <Input placeholder="Value or variable" />
            </Form.Item>

            <Form.Item name="rightValue" label="Right Value">
              <Input placeholder="Value or variable" />
            </Form.Item>
          </>
        )}

        {nodeData.type === 'quantum' && (
          <>
            <Form.Item name="quantumAlgorithm" label="Quantum Algorithm">
              <Select placeholder="Select quantum algorithm">
                <Option value="qaoa">QAOA Optimization</Option>
                <Option value="grover">Grover Search</Option>
                <Option value="sqd">Quantum Diagonalization</Option>
                <Option value="portfolio">Portfolio Optimization</Option>
              </Select>
            </Form.Item>

            <Form.Item name="quantumParams" label="Quantum Parameters">
              <Input.TextArea 
                rows={3} 
                placeholder='{"iterations": 10, "threshold": 0.8}' 
              />
            </Form.Item>

            <Form.Item name="quantumOptimized" valuePropName="checked">
              <Switch checkedChildren="Quantum ON" unCheckedChildren="Quantum OFF" />
            </Form.Item>
          </>
        )}

        <Form.Item name="retryOnError" valuePropName="checked">
          <Switch checkedChildren="Retry ON" unCheckedChildren="Retry OFF" />
        </Form.Item>

        <Form.Item name="maxRetries" label="Max Retries">
          <Input type="number" min={0} max={10} defaultValue={3} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Save Configuration
            </Button>
            <Button onClick={() => setDrawerVisible(false)}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    );
  };

  return (
    <div className="workflow-builder">
      <div className="workflow-header">
        <div className="workflow-title">
          <h2>🔧 Workflow Builder</h2>
          <span className="workflow-subtitle">
            {workflowConfig.name} {workflowConfig.quantumOptimized && '⚛️'}
          </span>
        </div>
        
        <div className="workflow-actions">
          <Space>
            <Button
              icon={<SettingOutlined />}
              onClick={() => setConfigModalVisible(true)}
            >
              Settings
            </Button>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={testWorkflow}
              disabled={nodes.length === 0}
            >
              Test
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={saveWorkflow}
              disabled={nodes.length === 0}
            >
              Save
            </Button>
          </Space>
        </div>
      </div>

      <div className="workflow-content">
        <div className="workflow-sidebar">
          {renderToolPanel()}
        </div>

        <div className="workflow-canvas">
          <ReactFlowProvider>
            <div className="reactflow-wrapper" ref={reactFlowWrapper}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                fitView
                attributionPosition="top-right"
              >
                <Background color="#f0f2f5" gap={20} />
                <Controls />
                <MiniMap 
                  nodeColor={(node) => nodeTypes[node.data.type]?.color || '#1890ff'}
                  maskColor="rgba(0, 0, 0, 0.1)"
                />
              </ReactFlow>
            </div>
          </ReactFlowProvider>
        </div>
      </div>

      {/* Drawer de configuração do nó */}
      <Drawer
        title={`Configure ${selectedNode?.data.label || 'Node'}`}
        placement="right"
        width={400}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {renderNodeConfig()}
      </Drawer>

      {/* Modal de configuração do workflow */}
      <Modal
        title="Workflow Settings"
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          initialValues={workflowConfig}
          onFinish={(values) => {
            setWorkflowConfig(values);
            setConfigModalVisible(false);
            message.success('Workflow settings updated');
          }}
        >
          <Form.Item
            name="name"
            label="Workflow Name"
            rules={[{ required: true, message: 'Please enter workflow name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="quantumOptimized" valuePropName="checked">
            <Switch 
              checkedChildren="⚛️ Quantum ON" 
              unCheckedChildren="Quantum OFF" 
            />
          </Form.Item>

          <Form.Item name="autoSave" valuePropName="checked">
            <Switch 
              checkedChildren="Auto-save ON" 
              unCheckedChildren="Auto-save OFF" 
            />
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

export default WorkflowBuilder;
