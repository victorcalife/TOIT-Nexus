/**
 * FORM BUILDER - NO-CODE TOIT NEXUS
 * Construtor visual de formulários com drag & drop
 */

import React, { useState, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Drawer, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Checkbox,
  Radio,
  DatePicker,
  InputNumber,
  Upload,
  Modal,
  message,
  Space,
  Tabs,
  Row,
  Col,
  Tooltip,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EyeOutlined, 
  SaveOutlined, 
  SettingOutlined,
  DragOutlined,
  DeleteOutlined,
  CopyOutlined,
  FormOutlined,
  CalendarOutlined,
  NumberOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './FormBuilder.css';

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

// Tipos de campos disponíveis
const fieldTypes = {
  text: {
    label: 'Text Input',
    icon: <FormOutlined />,
    component: Input,
    defaultProps: { placeholder: 'Enter text...' }
  },
  textarea: {
    label: 'Text Area',
    icon: <FileTextOutlined />,
    component: TextArea,
    defaultProps: { rows: 4, placeholder: 'Enter text...' }
  },
  number: {
    label: 'Number',
    icon: <NumberOutlined />,
    component: InputNumber,
    defaultProps: { style: { width: '100%' } }
  },
  select: {
    label: 'Select',
    icon: <FormOutlined />,
    component: Select,
    defaultProps: { placeholder: 'Select option...' }
  },
  checkbox: {
    label: 'Checkbox',
    icon: <CheckSquareOutlined />,
    component: Checkbox,
    defaultProps: {}
  },
  radio: {
    label: 'Radio Group',
    icon: <CheckSquareOutlined />,
    component: Radio.Group,
    defaultProps: {}
  },
  date: {
    label: 'Date Picker',
    icon: <CalendarOutlined />,
    component: DatePicker,
    defaultProps: { style: { width: '100%' } }
  },
  upload: {
    label: 'File Upload',
    icon: <PlusOutlined />,
    component: Upload,
    defaultProps: { listType: 'text' }
  },
  quantum: {
    label: 'Quantum Field',
    icon: <ExperimentOutlined />,
    component: Input,
    defaultProps: { placeholder: 'Quantum-optimized field...' }
  }
};

// Validações disponíveis
const validationRules = [
  { key: 'required', label: 'Required', type: 'boolean' },
  { key: 'minLength', label: 'Min Length', type: 'number' },
  { key: 'maxLength', label: 'Max Length', type: 'number' },
  { key: 'pattern', label: 'Pattern (Regex)', type: 'string' },
  { key: 'email', label: 'Email Format', type: 'boolean' },
  { key: 'url', label: 'URL Format', type: 'boolean' },
  { key: 'min', label: 'Min Value', type: 'number' },
  { key: 'max', label: 'Max Value', type: 'number' }
];

const FormBuilder = ({ formId, onSave, onPreview }) => {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [formConfig, setFormConfig] = useState({
    name: 'New Form',
    description: '',
    layout: 'vertical',
    quantumOptimized: true,
    submitAction: 'database',
    successMessage: 'Form submitted successfully!'
  });

  const [form] = Form.useForm();
  const [previewForm] = Form.useForm();

  // Adicionar campo
  const addField = (type) => {
    const newField = {
      id: `field_${Date.now()}`,
      type: type,
      name: `field_${fields.length + 1}`,
      label: `${fieldTypes[type].label} ${fields.length + 1}`,
      placeholder: fieldTypes[type].defaultProps.placeholder || '',
      required: false,
      validation: {},
      options: type === 'select' || type === 'radio' ? ['Option 1', 'Option 2'] : [],
      quantumOptimized: type === 'quantum',
      style: {},
      conditional: null
    };

    setFields([...fields, newField]);
    setSelectedField(newField);
    setDrawerVisible(true);
  };

  // Reordenar campos
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFields(items);
  };

  // Selecionar campo
  const selectField = (field) => {
    setSelectedField(field);
    setDrawerVisible(true);
  };

  // Duplicar campo
  const duplicateField = (field) => {
    const duplicatedField = {
      ...field,
      id: `field_${Date.now()}`,
      name: `${field.name}_copy`,
      label: `${field.label} (Copy)`
    };

    const fieldIndex = fields.findIndex(f => f.id === field.id);
    const newFields = [...fields];
    newFields.splice(fieldIndex + 1, 0, duplicatedField);
    setFields(newFields);
  };

  // Remover campo
  const removeField = (fieldId) => {
    setFields(fields.filter(f => f.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
      setDrawerVisible(false);
    }
  };

  // Salvar configuração do campo
  const saveFieldConfig = (config) => {
    if (!selectedField) return;

    setFields(fields.map(field =>
      field.id === selectedField.id
        ? { ...field, ...config }
        : field
    ));

    setDrawerVisible(false);
    message.success('Field configuration saved');
  };

  // Salvar formulário
  const saveForm = async () => {
    try {
      const formData = {
        id: formId || `form_${Date.now()}`,
        name: formConfig.name,
        description: formConfig.description,
        fields: fields,
        config: formConfig,
        version: '1.0.0',
        createdAt: new Date().toISOString()
      };

      if (onSave) {
        await onSave(formData);
      }

      message.success('Form saved successfully');
    } catch (error) {
      message.error('Failed to save form: ' + error.message);
    }
  };

  // Preview formulário
  const previewForm = () => {
    setPreviewModalVisible(true);
  };

  // Renderizar painel de campos
  const renderFieldPanel = () => (
    <Card title="📝 Form Fields" className="field-panel">
      <Tabs defaultActiveKey="basic" size="small">
        <TabPane tab="Basic" key="basic">
          <div className="field-types">
            {Object.entries(fieldTypes).filter(([key]) => key !== 'quantum').map(([type, config]) => (
              <Button
                key={type}
                block
                className="field-button"
                onClick={() => addField(type)}
                icon={config.icon}
              >
                {config.label}
              </Button>
            ))}
          </div>
        </TabPane>

        <TabPane tab="Quantum" key="quantum">
          <div className="quantum-fields">
            <Button
              block
              className="quantum-field-button"
              onClick={() => addField('quantum')}
              icon={<ExperimentOutlined />}
            >
              ⚛️ Quantum Input
            </Button>
            <p className="quantum-description">
              Quantum-optimized fields with AI validation and prediction
            </p>
          </div>
        </TabPane>

        <TabPane tab="Templates" key="templates">
          <div className="field-templates">
            <Button block onClick={() => addFormTemplate('contact')}>
              📞 Contact Form
            </Button>
            <Button block onClick={() => addFormTemplate('registration')}>
              👤 Registration Form
            </Button>
            <Button block onClick={() => addFormTemplate('survey')}>
              📊 Survey Form
            </Button>
          </div>
        </TabPane>
      </Tabs>
    </Card>
  );

  // Renderizar campo no formulário
  const renderFormField = (field, index) => (
    <Draggable key={field.id} draggableId={field.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`form-field ${snapshot.isDragging ? 'dragging' : ''}`}
        >
          <div className="field-header">
            <div {...provided.dragHandleProps} className="drag-handle">
              <DragOutlined />
            </div>
            <span className="field-label">{field.label}</span>
            <div className="field-actions">
              <Tooltip title="Configure">
                <Button
                  size="small"
                  type="text"
                  icon={<SettingOutlined />}
                  onClick={() => selectField(field)}
                />
              </Tooltip>
              <Tooltip title="Duplicate">
                <Button
                  size="small"
                  type="text"
                  icon={<CopyOutlined />}
                  onClick={() => duplicateField(field)}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeField(field.id)}
                />
              </Tooltip>
            </div>
          </div>
          
          <div className="field-content">
            {renderFieldPreview(field)}
          </div>
        </div>
      )}
    </Draggable>
  );

  // Renderizar preview do campo
  const renderFieldPreview = (field) => {
    const FieldComponent = fieldTypes[field.type].component;
    
    switch (field.type) {
      case 'select':
        return (
          <Select placeholder={field.placeholder} disabled style={{ width: '100%' }}>
            {field.options.map((option, index) => (
              <Option key={index} value={option}>{option}</Option>
            ))}
          </Select>
        );
      
      case 'radio':
        return (
          <Radio.Group disabled>
            {field.options.map((option, index) => (
              <Radio key={index} value={option}>{option}</Radio>
            ))}
          </Radio.Group>
        );
      
      case 'checkbox':
        return <Checkbox disabled>{field.label}</Checkbox>;
      
      case 'upload':
        return (
          <Upload disabled>
            <Button icon={<PlusOutlined />}>Upload File</Button>
          </Upload>
        );
      
      case 'quantum':
        return (
          <div className="quantum-field-preview">
            <Input 
              placeholder={field.placeholder} 
              disabled 
              suffix={<ExperimentOutlined style={{ color: '#722ed1' }} />}
            />
            <div className="quantum-indicator">⚛️ Quantum-optimized</div>
          </div>
        );
      
      default:
        return (
          <FieldComponent
            {...fieldTypes[field.type].defaultProps}
            placeholder={field.placeholder}
            disabled
          />
        );
    }
  };

  // Renderizar configuração do campo
  const renderFieldConfig = () => {
    if (!selectedField) return null;

    return (
      <Form
        form={form}
        layout="vertical"
        initialValues={selectedField}
        onFinish={saveFieldConfig}
      >
        <Tabs defaultActiveKey="basic" size="small">
          <TabPane tab="Basic" key="basic">
            <Form.Item
              name="label"
              label="Field Label"
              rules={[{ required: true, message: 'Please enter field label' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="name"
              label="Field Name"
              rules={[{ required: true, message: 'Please enter field name' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="placeholder" label="Placeholder">
              <Input />
            </Form.Item>

            <Form.Item name="description" label="Help Text">
              <TextArea rows={2} />
            </Form.Item>

            {(selectedField.type === 'select' || selectedField.type === 'radio') && (
              <Form.Item name="options" label="Options">
                <Select mode="tags" placeholder="Enter options...">
                  {selectedField.options?.map((option, index) => (
                    <Option key={index} value={option}>{option}</Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </TabPane>

          <TabPane tab="Validation" key="validation">
            <Form.Item name="required" valuePropName="checked">
              <Switch checkedChildren="Required" unCheckedChildren="Optional" />
            </Form.Item>

            {validationRules.map(rule => (
              <Form.Item
                key={rule.key}
                name={['validation', rule.key]}
                label={rule.label}
              >
                {rule.type === 'boolean' ? (
                  <Switch />
                ) : rule.type === 'number' ? (
                  <InputNumber style={{ width: '100%' }} />
                ) : (
                  <Input />
                )}
              </Form.Item>
            ))}
          </TabPane>

          <TabPane tab="Advanced" key="advanced">
            <Form.Item name="quantumOptimized" valuePropName="checked">
              <Switch 
                checkedChildren="⚛️ Quantum ON" 
                unCheckedChildren="Quantum OFF" 
              />
            </Form.Item>

            <Form.Item name="conditional" label="Show When">
              <Select placeholder="Select condition..." allowClear>
                {fields.filter(f => f.id !== selectedField.id).map(field => (
                  <Option key={field.id} value={field.id}>
                    {field.label} is filled
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name={['style', 'width']} label="Field Width">
              <Select>
                <Option value="25%">25%</Option>
                <Option value="50%">50%</Option>
                <Option value="75%">75%</Option>
                <Option value="100%">100%</Option>
              </Select>
            </Form.Item>
          </TabPane>
        </Tabs>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Save Field
            </Button>
            <Button onClick={() => setDrawerVisible(false)}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    );
  };

  // Renderizar preview do formulário
  const renderFormPreview = () => (
    <Form
      form={previewForm}
      layout={formConfig.layout}
      onFinish={(values) => {
        console.log('Form values:', values);
        message.success(formConfig.successMessage);
      }}
    >
      {fields.map(field => (
        <Form.Item
          key={field.id}
          name={field.name}
          label={field.label}
          rules={[
            { required: field.required, message: `${field.label} is required` },
            ...(field.validation?.minLength ? [{ min: field.validation.minLength }] : []),
            ...(field.validation?.maxLength ? [{ max: field.validation.maxLength }] : []),
            ...(field.validation?.pattern ? [{ pattern: new RegExp(field.validation.pattern) }] : []),
            ...(field.validation?.email ? [{ type: 'email' }] : []),
            ...(field.validation?.url ? [{ type: 'url' }] : [])
          ]}
          help={field.description}
        >
          {renderFieldPreview(field)}
        </Form.Item>
      ))}
      
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit Form
        </Button>
      </Form.Item>
    </Form>
  );

  // Adicionar template de formulário
  const addFormTemplate = (type) => {
    let templateFields = [];

    switch (type) {
      case 'contact':
        templateFields = [
          { type: 'text', name: 'name', label: 'Full Name', required: true },
          { type: 'text', name: 'email', label: 'Email', required: true, validation: { email: true } },
          { type: 'text', name: 'phone', label: 'Phone Number' },
          { type: 'select', name: 'subject', label: 'Subject', options: ['General Inquiry', 'Support', 'Sales'] },
          { type: 'textarea', name: 'message', label: 'Message', required: true }
        ];
        break;
      
      case 'registration':
        templateFields = [
          { type: 'text', name: 'firstName', label: 'First Name', required: true },
          { type: 'text', name: 'lastName', label: 'Last Name', required: true },
          { type: 'text', name: 'email', label: 'Email', required: true, validation: { email: true } },
          { type: 'text', name: 'password', label: 'Password', required: true },
          { type: 'date', name: 'birthDate', label: 'Date of Birth' },
          { type: 'checkbox', name: 'terms', label: 'I agree to the terms and conditions', required: true }
        ];
        break;
      
      case 'survey':
        templateFields = [
          { type: 'radio', name: 'satisfaction', label: 'How satisfied are you?', options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'] },
          { type: 'select', name: 'frequency', label: 'How often do you use our service?', options: ['Daily', 'Weekly', 'Monthly', 'Rarely'] },
          { type: 'number', name: 'rating', label: 'Rate us (1-10)' },
          { type: 'textarea', name: 'feedback', label: 'Additional Feedback' }
        ];
        break;
    }

    const newFields = templateFields.map((field, index) => ({
      id: `field_${Date.now()}_${index}`,
      placeholder: '',
      quantumOptimized: false,
      style: {},
      conditional: null,
      validation: {},
      options: [],
      ...field
    }));

    setFields([...fields, ...newFields]);
    message.success(`${type} form template added`);
  };

  return (
    <div className="form-builder">
      <div className="form-header">
        <div className="form-title">
          <h2>📝 Form Builder</h2>
          <span className="form-subtitle">
            {formConfig.name} {formConfig.quantumOptimized && '⚛️'}
          </span>
        </div>
        
        <div className="form-actions">
          <Space>
            <Button
              icon={<SettingOutlined />}
              onClick={() => setConfigModalVisible(true)}
            >
              Settings
            </Button>
            <Button
              icon={<EyeOutlined />}
              onClick={previewForm}
              disabled={fields.length === 0}
            >
              Preview
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={saveForm}
              disabled={fields.length === 0}
            >
              Save
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-content">
        <div className="form-sidebar">
          {renderFieldPanel()}
        </div>

        <div className="form-canvas">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="form-fields">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="form-fields-container"
                >
                  {fields.length === 0 ? (
                    <div className="empty-form">
                      <FormOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                      <p>Drag fields here to build your form</p>
                    </div>
                  ) : (
                    fields.map((field, index) => renderFormField(field, index))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      {/* Drawer de configuração do campo */}
      <Drawer
        title={`Configure ${selectedField?.label || 'Field'}`}
        placement="right"
        width={400}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {renderFieldConfig()}
      </Drawer>

      {/* Modal de configuração do formulário */}
      <Modal
        title="Form Settings"
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          initialValues={formConfig}
          onFinish={(values) => {
            setFormConfig(values);
            setConfigModalVisible(false);
            message.success('Form settings updated');
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Form Name"
                rules={[{ required: true, message: 'Please enter form name' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="layout" label="Layout">
                <Select>
                  <Option value="vertical">Vertical</Option>
                  <Option value="horizontal">Horizontal</Option>
                  <Option value="inline">Inline</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="submitAction" label="Submit Action">
                <Select>
                  <Option value="database">Save to Database</Option>
                  <Option value="email">Send Email</Option>
                  <Option value="api">Call API</Option>
                  <Option value="quantum">Quantum Process</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="successMessage" label="Success Message">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="quantumOptimized" valuePropName="checked">
                <Switch 
                  checkedChildren="⚛️ Quantum ON" 
                  unCheckedChildren="Quantum OFF" 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="autoSave" valuePropName="checked">
                <Switch 
                  checkedChildren="Auto-save ON" 
                  unCheckedChildren="Auto-save OFF" 
                />
              </Form.Item>
            </Col>
          </Row>

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

      {/* Modal de preview */}
      <Modal
        title={`Preview: ${formConfig.name}`}
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={null}
        width={800}
      >
        {renderFormPreview()}
      </Modal>
    </div>
  );
};

export default FormBuilder;
