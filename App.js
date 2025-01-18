import React, { useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './App.css';
import { Input, Select, Switch, Button, Modal, Form, Input as AntInput, notification } from 'antd';

const { Option } = Select;
let sampleEmployeeData = null;

if (localStorage.getItem("EmployeeData") !== undefined && localStorage.getItem("EmployeeData") !== null) {
  sampleEmployeeData = new Map(JSON.parse(localStorage.getItem("EmployeeData")));
} else {
  sampleEmployeeData = new Map([
    [1, { id: 1, name: 'John Doe', department: 'Engineering', role: 'Developer', salary: 5000, status: 'Active' }],
    [2, { id: 2, name: 'Jane Smith', department: 'HR', role: 'Manager', salary: 6000, status: 'Inactive' }]
  ]);
}
let employeecount=3;
const App = () => {
  const [employees, setEmployees] = useState(Array.from(sampleEmployeeData.values()));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const gridRef = useRef(null);

  const departments = Array.from(new Set(employees.map(emp => emp.department))); 

  const columnDefs = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      width: 50
    },
    { 
      headerName: 'Employee ID', 
      field: 'id', 
      sortable: true, 
      filter: true, 
      flex: 1 
    },
    { 
      headerName: 'Name', 
      field: 'name', 
      sortable: true, 
      filter: 'agTextColumnFilter',
      flex: 1 
    },
    { 
      headerName: 'Department', 
      field: 'department', 
      sortable: true, 
      filter: 'agSetColumnFilter',
      flex: 1 
    },
    { 
      headerName: 'Role', 
      field: 'role', 
      sortable: true, 
      filter: true,
      flex: 1 
    },
    { 
      headerName: 'Salary', 
      field: 'salary', 
      sortable: true, 
      filter: true,
      flex: 1 
    },
    { 
      headerName: 'Status', 
      field: 'status', 
      sortable: true, 
      filter: true,
      flex: 1,
      cellRendererFramework: (params) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px' }}>
            {params.value}
          </span>
          <Switch
            checked={params.value === 'Active'}
            onChange={() => handleStatusChange(params)}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
          />
        </div>
      )
    }
    
  ];

const handleEdit = (params) => {
  setEditingEmployee(params.data);
  setModalVisible(true);  
};

const handleDelete = (params) => {
  Modal.confirm({
    title: 'Are you sure you want to delete this employee?',
    onOk: () => {
      sampleEmployeeData.delete(params.data.id);
      localStorage.setItem("EmployeeData", JSON.stringify(Array.from(sampleEmployeeData.entries())));
      setEmployees(Array.from(sampleEmployeeData.values()));
      notification.success({ message: 'Employee deleted successfully!' });
    }
  });
};


  
  const handleStatusChange = (params) => {
    const updatedEmployee = { ...params.data, status: params.data.status === 'Active' ? 'Inactive' : 'Active' };
    sampleEmployeeData.set(updatedEmployee.id, updatedEmployee);
    localStorage.setItem("EmployeeData", JSON.stringify(Array.from(sampleEmployeeData.entries())));
    setEmployees(Array.from(sampleEmployeeData.values()));
  };

  const handleSave = (values) => {
    values.salary = Number(values.salary)
    values.id=employeecount++;
    console.log(values);
    const updatedEmployee = { ...editingEmployee, ...values };
    sampleEmployeeData.set(updatedEmployee.id, updatedEmployee);
    console.log(updatedEmployee);
    localStorage.setItem("EmployeeData", JSON.stringify(Array.from(sampleEmployeeData.entries())));
    setEmployees(Array.from(sampleEmployeeData.values()));
    setModalVisible(false);
    notification.success({ message: 'Employee details updated!' });
  };

  const handleAddNewEmployee = () => {
    setEditingEmployee(null);
    setModalVisible(true);
  };

  const filteredEmployees = employees.filter(emp => {
    const departmentMatch = selectedDepartment ? emp.department === selectedDepartment : true;
    const nameMatch = emp.name.toLowerCase().includes(searchQuery.toLowerCase());
    return departmentMatch && nameMatch;
  });

  const handleDeleteSelected = () => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    if (selectedRows.length === 0) {
      notification.error({ message: 'No employees selected!' });
      return;
    }
    Modal.confirm({
      title: 'Are you sure you want to delete the selected employees?',
      onOk: () => {
        selectedRows.forEach(row => {
          sampleEmployeeData.delete(row.id);
        });
        localStorage.setItem("EmployeeData", JSON.stringify(Array.from(sampleEmployeeData.entries())));
        setEmployees(Array.from(sampleEmployeeData.values()));
        notification.success({ message: 'Employees deleted successfully!' });
      },
    });
  };

  const handleExportCSV = () => {
    gridRef.current.api.exportDataAsCsv();
  };

  const onGridReady = (params) => {
    try{
        if (params.api) {
          const savedGridState = localStorage.getItem('gridState');
          if (savedGridState) {
            params.api.setColumnState(JSON.parse(savedGridState));
          }
        }
    }catch(even){

    }
  };

  const onGridStateChange = () => {
    if (gridRef.current && gridRef.current.api) {
      const gridState = {
        columnState: gridRef.current.api.getColumnState(),
      };
      localStorage.setItem('gridState', JSON.stringify(gridState));
    }
  };

  return (
    <div className="App">
      <Input
        style={{ marginBottom: '10px', width: '300px' }}
        placeholder="Search Employee by Name"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      <Select
        style={{ marginBottom: '10px', width: '300px' }}
        placeholder="Select Department"
        onChange={setSelectedDepartment}
        value={selectedDepartment}
      >
        <Option value="">All Departments</Option>
        {departments.map(department => (
          <Option key={department} value={department}>
            {department}
          </Option>
        ))}
      </Select>

      <Button type="primary" onClick={handleAddNewEmployee} style={{ marginBottom: '20px' }}>
        Add Employee
      </Button>

      <Button type="danger" onClick={handleDeleteSelected} style={{ marginBottom: '20px', marginLeft: '10px' }}>
        Delete Selected Employees
      </Button>

      <Button type="primary" onClick={handleExportCSV} style={{ marginBottom: '20px', marginLeft: '10px' }}>
        Export to CSV
      </Button>

      <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          onGridReady={onGridReady}
          onGridStateChanged={onGridStateChange}
          columnDefs={columnDefs}
          rowData={filteredEmployees}
          pagination={true}
          paginationPageSize={10}
          domLayout="autoHeight"
          rowSelection="multiple"
        />
      </div>

      <Modal
        title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          initialValues={editingEmployee || { status: 'Active' }}
          onFinish={handleSave}
          layout="vertical"
        >
          <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please input the name!' }]}>
            <AntInput />
          </Form.Item>
          <Form.Item label="Department" name="department" rules={[{ required: true, message: 'Please select the department!' }]}>
            <Select>
              {departments.map(department => (
                <Option key={department} value={department}>{department}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Role" name="role" rules={[{ required: true, message: 'Please input the role!' }]}>
            <AntInput />
          </Form.Item>
          <Form.Item label="Salary" name="salary" rules={[{ required: true, message: 'Please input the salary!' }]}>
            <AntInput type="number" />
          </Form.Item>
          <Form.Item label="Status" name="status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingEmployee ? 'Save Changes' : 'Add Employee'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default App;
