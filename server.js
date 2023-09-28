const mysql = require("mysql2/promise");
const inquirer = require("inquirer");
require("dotenv").config();

// Create a database connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

async function viewDepartments() {
  const [rows] = await db.execute("SELECT id, name FROM department");
  console.table(rows);
}

async function viewRoles() {
  const query = `
        SELECT role.id, title, name AS department, salary
        FROM role
        JOIN department ON department.id = role.department_id
    `;
  const [rows] = await db.execute(query);
  console.table(rows);
}

async function viewEmployees() {
  const query = `
        SELECT employee.id, 
               employee.first_name, 
               employee.last_name, 
               title, 
               department.name AS department, 
               salary,
               CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM employee
        JOIN role ON employee.role_id = role.id
        JOIN department ON role.department_id = department.id
        LEFT JOIN employee AS manager ON employee.manager_id = manager.id
    `;
  const [rows] = await db.execute(query);
  console.table(rows);
}

async function addDepartment() {
  const { name } = await inquirer.prompt({
    type: "input",
    name: "name",
    message: "Enter the name of the department:",
  });
  await db.execute("INSERT INTO department (name) VALUES (?)", [name]);
  console.log("Department added successfully.");
}

async function addRole() {
  const departments = await db.execute("SELECT id, name FROM department");
  const { title, salary, departmentId } = await inquirer.prompt([
    {
      type: "input",
      name: "title",
      message: "Enter the title of the role:",
    },
    {
      type: "input",
      name: "salary",
      message: "Enter the salary for the role:",
      validate: (value) =>
        (!isNaN(value) && value > 0) ||
        "Please enter a valid number greater than 0",
    },
    {
      type: "list",
      name: "departmentId",
      message: "Select the department for the role:",
      choices: departments[0].map((department) => ({
        name: department.name,
        value: department.id,
      })),
    },
  ]);
  await db.execute(
    "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
    [title, salary, departmentId]
  );
  console.log("Role added successfully.");
}

async function addEmployee() {
  const roles = await db.execute("SELECT id, title FROM role");
  const managers = await db.execute(
    "SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee WHERE manager_id IS NULL"
  );
  const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
    {
      type: "input",
      name: "firstName",
      message: "Enter the first name of the employee:",
    },
    {
      type: "input",
      name: "lastName",
      message: "Enter the last name of the employee:",
    },
    {
      type: "list",
      name: "roleId",
      message: "Select the role for the employee:",
      choices: roles[0].map((role) => ({
        name: role.title,
        value: role.id,
      })),
    },
    {
      type: "list",
      name: "managerId",
      message: "Select the manager for the employee:",
      choices: managers[0]
        .map((manager) => ({
          name: manager.name,
          value: manager.id,
        }))
        .concat({ name: "No Manager", value: null }),
    },
  ]);
  await db.execute(
    "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
    [firstName, lastName, roleId, managerId]
  );
  console.log("Employee added successfully.");
}

async function updateEmployeeRole() {
  const employees = await db.execute(
    "SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee"
  );
  const roles = await db.execute("SELECT id, title FROM role");
  const { employeeId, roleId } = await inquirer.prompt([
    {
      type: "list",
      name: "employeeId",
      message: "Select the employee to update:",
      choices: employees[0].map((employee) => ({
        name: employee.name,
        value: employee.id,
      })),
    },
    {
      type: "list",
      name: "roleId",
      message: "Select the new role for the employee:",
      choices: roles[0].map((role) => ({
        name: role.title,
        value: role.id,
      })),
    },
  ]);
  await db.execute("UPDATE employee SET role_id = ? WHERE id = ?", [
    roleId,
    employeeId,
  ]);
  console.log("Employee role updated successfully.");
}

async function main() {
  let exit = false;

  while (!exit) {
    const { action } = await inquirer.prompt({
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update an employee role",
        "Exit",
      ],
    });

    switch (action) {
      case "View all departments":
        await viewDepartments();
        break;
      case "View all roles":
        await viewRoles();
        break;
      case "View all employees":
        await viewEmployees();
        break;
      case "Add a department":
        await addDepartment();
        break;
      case "Add a role":
        await addRole();
        break;
      case "Add an employee":
        await addEmployee();
        break;
      case "Update an employee role":
        await updateEmployeeRole();
        break;
      case "Exit":
        exit = true;
        break;
    }
  }

  db.end();
}

main();
