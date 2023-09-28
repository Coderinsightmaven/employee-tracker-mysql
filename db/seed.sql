-- Seed the department table
INSERT INTO department (name)
VALUES 
    ('Sales'),
    ('Engineering'),
    ('Marketing'),
    ('Finance'),
    ('Human Resources');

-- Seed the role table
INSERT INTO role (title, salary, department_id)
VALUES 
    ('Sales Manager', 80000, 1),
    ('Software Engineer', 70000, 2),
    ('Marketing Specialist', 60000, 3),
    ('Financial Analyst', 65000, 4),
    ('HR Coordinator', 55000, 5);

-- Seed the employee table
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
    ('John', 'Doe', 1, NULL), -- John Doe is the Sales Manager and has no manager
    ('Jane', 'Smith', 2, NULL), -- Jane Smith is a Software Engineer and has no manager
    ('Mike', 'Johnson', 3, 1), -- Mike Johnson is a Marketing Specialist and reports to John Doe
    ('Emily', 'Davis', 4, 1), -- Emily Davis is a Financial Analyst and reports to John Doe
    ('Anna', 'Taylor', 5, NULL); -- Anna Taylor is an HR Coordinator and has no manager
