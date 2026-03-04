# FDFED React - ER Diagrams & Wireframes

This document contains Entity-Relationship diagrams for the database schemas and wireframe diagrams for the application routing structure. All diagrams are in Mermaid format and can be converted to images using any Mermaid-compatible renderer.

---

## 1. Database Entity-Relationship Diagram

### Complete ER Diagram

```mermaid
erDiagram
    BRANCH {
        string bid PK "Branch ID (unique)"
        string b_name "Branch name"
        string location "Branch location"
        ObjectId manager_id FK "ref: Employee"
        string manager_name "default: Not Assigned"
        string manager_email "default: N/A"
        string manager_ph_no "default: N/A"
        boolean manager_assigned "default: false"
        date createdAt "default: Date.now"
        string active "enum: active, inactive"
    }

    COMPANY {
        string c_id PK "Company ID (unique)"
        string cname "Company name"
        string email "required"
        string phone "required"
        string address "required"
        date createdAt "default: Date.now"
        string active "enum: active, inactive"
    }

    EMPLOYEE {
        string e_id PK "Employee ID (unique)"
        string f_name "First name"
        string last_name "Last name"
        string role "enum: owner, manager, salesman"
        string bid FK "ref: Branch"
        string email "unique, required"
        string phone_no "10 digits"
        date hiredAt "default: Date.now"
        string address "optional"
        string status "enum: active, resigned, fired"
        date resignation_date "optional"
        date fired_date "optional"
        string reason_for_exit "optional"
        string acno "Account number"
        string ifsc "IFSC code"
        string bankname "Bank name"
        number base_salary "required"
        string createdBy "required"
    }

    CUSTOMER {
        string customer_id PK "Customer ID (unique)"
        string first_name "required"
        string last_name "required"
        string phno "Phone number"
        string email UK "unique, required"
        string createdBy "required"
        date createdAt "default: Date.now"
    }

    PRODUCT {
        string prod_id PK "Product ID (unique)"
        string Prod_name "Product name"
        string Com_id FK "ref: Company"
        string Model_no "Model number"
        string com_name "Company name"
        string prod_year "Production year"
        number stock "Stock quantity"
        number Retail_price "Retail price"
        number miniselling "default: 1"
        number installationcharge "default: 0"
        string stockavailability "enum: instock, outofstock"
        string Status "enum: Hold, Accepted, Rejected"
        string rejection_reason "optional"
        string prod_description "Description"
        string warrantyperiod "Warranty period"
        string installation "enum: Required, Not Required"
        string installationType "enum: Paid, Free"
        array prod_photos "Array of photo URLs"
        date createdAt "default: Date.now"
        date approvedAt "optional"
    }

    INVENTORY {
        string branch_id FK "ref: Branch"
        string branch_name "Branch name"
        string product_id FK "ref: Product"
        string product_name "Product name"
        string company_id FK "ref: Company"
        string company_name "Company name"
        string model_no "Model number"
        number quantity "default: 0"
        date updatedAt "default: Date.now"
    }

    ORDER {
        string order_id PK "Order ID (unique)"
        string branch_id FK "ref: Branch"
        string branch_name "Branch name"
        string company_id FK "ref: Company"
        string company_name "Company name"
        string product_id FK "ref: Product"
        string product_name "Product name"
        number quantity "required"
        date ordered_date "required"
        date delivery_date "optional"
        string status "enum: pending, cancelled, shipped, delivered, accepted"
        string installation_type "default: None"
        date createdAt "auto"
        date updatedAt "auto"
    }

    SALE {
        string sales_id PK "Sales ID (unique)"
        string branch_id FK "ref: Branch"
        string salesman_id FK "ref: Employee"
        string company_id FK "ref: Company"
        string product_id FK "ref: Product"
        string customer_name "Customer name"
        date sales_date "required"
        string unique_code UK "Unique sale code"
        number purchased_price "required"
        number sold_price "required"
        number quantity "required"
        number amount "required"
        number profit_or_loss "required"
        string phone_number "E.164 format"
        string customer_email "optional"
        string address "optional"
        string review "optional"
        number rating "1-5"
        string installation "enum: Required, Not Required"
        string installationType "enum: Paid, Free"
        string installationcharge "optional"
        string installation_status "enum: Pending, Completed, null"
        date createdAt "default: Date.now"
    }

    COMPLAINT {
        string complaint_id PK "Complaint ID (unique)"
        string sale_id FK "ref: Sale"
        string product_id FK "ref: Product"
        string company_id FK "ref: Company"
        string complaint_info "Complaint details"
        date complaint_date "default: Date.now"
        string phone_number "E.164 format"
        string status "enum: Open, Closed"
        date createdAt "default: Date.now"
    }

    MESSAGE {
        string from "Sender ID"
        string to "Receiver ID"
        string category "Message category"
        string message "Message content"
        date timestamp "default: Date.now"
        string branch_id "optional"
        string c_id "optional"
        string emp_id "optional"
    }

    USER {
        string userId PK "User ID (unique)"
        string emp_id FK "ref: Employee (optional)"
        string c_id FK "ref: Company (optional)"
        string password "min 6 chars"
        date createdAt "default: Date.now"
    }

    %% Relationships
    BRANCH ||--o| EMPLOYEE : "managed_by"
    EMPLOYEE }o--|| BRANCH : "works_at"
    PRODUCT }o--|| COMPANY : "manufactured_by"
    INVENTORY }o--|| BRANCH : "stored_at"
    INVENTORY }o--|| PRODUCT : "contains"
    INVENTORY }o--|| COMPANY : "supplied_by"
    ORDER }o--|| BRANCH : "ordered_by"
    ORDER }o--|| COMPANY : "ordered_from"
    ORDER }o--|| PRODUCT : "order_for"
    SALE }o--|| BRANCH : "sold_at"
    SALE }o--|| EMPLOYEE : "sold_by"
    SALE }o--|| COMPANY : "product_from"
    SALE }o--|| PRODUCT : "product_sold"
    COMPLAINT }o--|| SALE : "complaint_for"
    COMPLAINT }o--|| PRODUCT : "about_product"
    COMPLAINT }o--|| COMPANY : "against_company"
    USER |o--o| EMPLOYEE : "employee_account"
    USER |o--o| COMPANY : "company_account"
```

---

## 2. Simplified ER Diagram (Core Relationships)

```mermaid
erDiagram
    BRANCH ||--o| EMPLOYEE : "has_manager"
    EMPLOYEE }o--|| BRANCH : "assigned_to"
    
    COMPANY ||--o{ PRODUCT : "manufactures"
    
    BRANCH ||--o{ INVENTORY : "stores"
    PRODUCT ||--o{ INVENTORY : "stocked_in"
    COMPANY ||--o{ INVENTORY : "supplies"
    
    BRANCH ||--o{ ORDER : "places"
    COMPANY ||--o{ ORDER : "receives"
    PRODUCT ||--o{ ORDER : "ordered"
    
    BRANCH ||--o{ SALE : "sale_location"
    EMPLOYEE ||--o{ SALE : "sold_by"
    COMPANY ||--o{ SALE : "product_company"
    PRODUCT ||--o{ SALE : "product_sold"
    
    SALE ||--o{ COMPLAINT : "has_complaint"
    PRODUCT ||--o{ COMPLAINT : "complained_about"
    COMPANY ||--o{ COMPLAINT : "complaint_against"
    
    EMPLOYEE ||--o| USER : "has_account"
    COMPANY ||--o| USER : "has_account"
    CUSTOMER ||--o| USER : "has_account"
```

---

## 3. Application Wireframe - Routing Structure

### 3.1 Complete Application Flow

```mermaid
flowchart TB
    subgraph PUBLIC["🌐 Public Routes"]
        HOME["/  HomePage"]
        NEW["/newproducts  NewProducts"]
        OUR["/ourproducts  OurProducts"]
        TOP["/topproducts  TopProducts"]
        BRANCHES["/our-branches  OurBranches"]
        ABOUT["/about-us  AboutUs"]
        CONTACT["/contact-us  ContactUs"]
        LOGIN["/login  LoginPage"]
        CLOGIN["/companylogin  CompanyLogin"]
        CUSLOGIN["/customerlogin  CustomerLoginPage"]
        FORGOT["/forgot-password  ForgotPassword"]
    end

    subgraph AUTH["🔐 Authentication"]
        DASHBOARD["/dashboard  PostLoginRedirect"]
    end

    subgraph OWNER["👑 Owner Routes"]
        O_ANALYTICS["/owner/analytics"]
        O_EMPLOYEES["/owner/employees"]
        O_COMPANIES["/owner/companies"]
        O_BRANCHES["/owner/branches"]
        O_PRODUCTS["/owner/products"]
        O_SALES["/owner/sales"]
        O_ORDERS["/owner/orders"]
        O_INVENTORY["/owner/inventory"]
        O_SALARIES["/owner/salaries"]
        O_PROFITS["/owner/profits"]
        O_MESSAGES["/owner/messages"]
    end

    subgraph MANAGER["👔 Manager Routes"]
        M_EMPLOYEES["/manager/employees"]
        M_EMP_DETAIL["/manager/employees/:e_id"]
        M_PROFILE["/manager/profile"]
        M_ORDERS["/manager/orders"]
        M_ORDER_DETAIL["/manager/orders/:id"]
        M_INVENTORY["/manager/inventory"]
        M_SALES["/manager/sales"]
        M_SALARY["/manager/salary"]
        M_ANALYTICS["/manager/analytics"]
        M_MESSAGES["/manager/messages"]
    end

    subgraph SALESMAN["🛒 Salesman Routes"]
        S_ANALYTICS["/salesman/analytics"]
        S_PROFILE["/salesman/profile"]
        S_SALES["/salesman/sales/*"]
        S_INVENTORY["/salesman/inventory"]
        S_SALARIES["/salesman/salaries"]
        S_MESSAGES["/salesman/messages"]
    end

    subgraph COMPANY["🏢 Company Routes"]
        C_ANALYTICS["/company/analytics"]
        C_PRODUCTS["/company/products"]
        C_ORDERS["/company/orders"]
        C_COMPLAINTS["/company/complaints"]
        C_SALES["/company/sales"]
        C_SALE_DETAIL["/company/sales/:id"]
        C_MESSAGES["/company/messages"]
    end

    subgraph CUSTOMER["👤 Customer Routes"]
        CU_PURCHASES["/customer/previouspurchases"]
        CU_COMPLAINTS["/customer/complaints"]
        CU_REVIEW["/customer/review"]
        CU_BLOGS["/customer/blogs"]
    end

    subgraph ERROR["⚠️ Error"]
        NOTFOUND["* NotFoundPage"]
    end

    LOGIN --> DASHBOARD
    CLOGIN --> DASHBOARD
    CUSLOGIN --> DASHBOARD

    DASHBOARD -->|owner| O_ANALYTICS
    DASHBOARD -->|manager| M_ANALYTICS
    DASHBOARD -->|salesman| S_ANALYTICS
    DASHBOARD -->|company| C_ANALYTICS
    DASHBOARD -->|customer| CU_PURCHASES
```

---

### 3.2 Public Routes Wireframe

```mermaid
flowchart LR
    subgraph PublicLayout["📄 Public Layout"]
        direction TB
        NAV["Navigation Bar"]
        CONTENT["Page Content"]
        FOOTER["Footer"]
    end

    subgraph Pages["Public Pages"]
        HOME["🏠 HomePage"]
        PRODUCTS["📦 Products"]
        INFO["ℹ️ Information"]
        AUTH["🔐 Authentication"]
    end

    subgraph ProductPages["Product Pages"]
        NEW["/newproducts"]
        OUR["/ourproducts"]
        TOP["/topproducts"]
    end

    subgraph InfoPages["Info Pages"]
        BRANCHES["/our-branches"]
        ABOUT["/about-us"]
        CONTACT["/contact-us"]
    end

    subgraph AuthPages["Auth Pages"]
        LOGIN["/login - Employee"]
        CLOGIN["/companylogin - Company"]
        CUSLOGIN["/customerlogin - Customer"]
        FORGOT["/forgot-password"]
    end

    NAV --> HOME
    NAV --> PRODUCTS
    NAV --> INFO
    NAV --> AUTH

    PRODUCTS --> ProductPages
    INFO --> InfoPages
    AUTH --> AuthPages
```

---

### 3.3 Owner Dashboard Wireframe

```mermaid
flowchart TB
    subgraph OwnerDashboard["👑 Owner Dashboard"]
        direction LR
        SIDEBAR["Sidebar Navigation"]
        MAIN["Main Content Area"]
    end

    subgraph SidebarItems["Sidebar Menu"]
        ANALYTICS["📊 Analytics"]
        EMPLOYEES["👥 Employees"]
        COMPANIES["🏢 Companies"]
        BRANCHES["🏪 Branches"]
        PRODUCTS["📦 Products"]
        SALES["💰 Sales"]
        ORDERS["📋 Orders"]
        INVENTORY["📦 Inventory"]
        SALARIES["💵 Salaries"]
        PROFITS["📈 Profits"]
        MESSAGES["✉️ Messages"]
    end

    SIDEBAR --> SidebarItems
    
    ANALYTICS --> |renders| A_PAGE["OwnerAnalyticsPage"]
    EMPLOYEES --> |renders| E_PAGE["EmployeesPage"]
    COMPANIES --> |renders| C_PAGE["CompanyPage"]
    BRANCHES --> |renders| B_PAGE["BranchPage"]
    PRODUCTS --> |renders| P_PAGE["Products"]
    SALES --> |renders| S_PAGE["OwnerSales"]
    ORDERS --> |renders| O_PAGE["AdminOrders"]
    INVENTORY --> |renders| I_PAGE["Admin_Inventory"]
    SALARIES --> |renders| SA_PAGE["Admin_salary"]
    PROFITS --> |renders| PR_PAGE["Admin_Profits"]
    MESSAGES --> |renders| M_PAGE["Admin_messages"]
```

---

### 3.4 Manager Dashboard Wireframe

```mermaid
flowchart TB
    subgraph ManagerDashboard["👔 Manager Dashboard"]
        direction LR
        SIDEBAR["Sidebar Navigation"]
        MAIN["Main Content Area"]
    end

    subgraph SidebarItems["Sidebar Menu"]
        ANALYTICS["📊 Analytics"]
        EMPLOYEES["👥 Employees"]
        PROFILE["👤 Profile"]
        ORDERS["📋 Orders"]
        INVENTORY["📦 Inventory"]
        SALES["💰 Sales"]
        SALARY["💵 Salary"]
        MESSAGES["✉️ Messages"]
    end

    SIDEBAR --> SidebarItems
    
    ANALYTICS --> A_PAGE["ManagerAnalyticsPage"]
    EMPLOYEES --> E_LIST["ManagerEmployeesPage"]
    E_LIST --> E_DETAIL["ManagerEmployeeDetails\n/:e_id"]
    PROFILE --> P_PAGE["ManagerProfileEdit"]
    ORDERS --> O_LIST["ManagerOrdersPage"]
    O_LIST --> O_DETAIL["ManagerOrderDetails\n/:id"]
    INVENTORY --> I_PAGE["ManagerInventoryPage"]
    SALES --> S_PAGE["Manager_Sales"]
    SALARY --> SA_PAGE["ManagerSalaryPage"]
    MESSAGES --> M_PAGE["ManagerMessages"]
```

---

### 3.5 Salesman Dashboard Wireframe

```mermaid
flowchart TB
    subgraph SalesmanDashboard["🛒 Salesman Dashboard"]
        direction LR
        SIDEBAR["Sidebar Navigation"]
        MAIN["Main Content Area"]
    end

    subgraph SidebarItems["Sidebar Menu"]
        ANALYTICS["📊 Analytics"]
        PROFILE["👤 Profile"]
        SALES["💰 Sales"]
        INVENTORY["📦 Inventory"]
        SALARIES["💵 Salaries"]
        MESSAGES["✉️ Messages"]
    end

    SIDEBAR --> SidebarItems
    
    ANALYTICS --> A_PAGE["SalesmanAnalyticsPage"]
    PROFILE --> P_PAGE["Details"]
    SALES --> S_PAGE["Sales\n(wildcard sub-routes)"]
    INVENTORY --> I_PAGE["Inventory"]
    SALARIES --> SA_PAGE["Salaries"]
    MESSAGES --> M_PAGE["SalesmanMessages"]
```

---

### 3.6 Company Dashboard Wireframe

```mermaid
flowchart TB
    subgraph CompanyDashboard["🏢 Company Dashboard"]
        direction LR
        SIDEBAR["Sidebar Navigation"]
        MAIN["Main Content Area"]
    end

    subgraph SidebarItems["Sidebar Menu"]
        ANALYTICS["📊 Analytics"]
        PRODUCTS["📦 Products"]
        ORDERS["📋 Orders"]
        COMPLAINTS["⚠️ Complaints"]
        SALES["💰 Sales"]
        MESSAGES["✉️ Messages"]
    end

    SIDEBAR --> SidebarItems
    
    ANALYTICS --> A_PAGE["CompanyAnalyticsPage"]
    PRODUCTS --> P_PAGE["CompanyProducts"]
    ORDERS --> O_PAGE["CompanyOrders"]
    COMPLAINTS --> C_PAGE["CompanyComplaints"]
    SALES --> S_LIST["CompanySales"]
    S_LIST --> S_DETAIL["CompanySaleDetails\n/:id"]
    MESSAGES --> M_PAGE["Companymessages"]
```

---

### 3.7 Customer Dashboard Wireframe

```mermaid
flowchart TB
    subgraph CustomerDashboard["👤 Customer Dashboard"]
        direction LR
        SIDEBAR["Sidebar Navigation"]
        MAIN["Main Content Area"]
    end

    subgraph SidebarItems["Sidebar Menu"]
        PURCHASES["🛍️ Previous Purchases"]
        COMPLAINTS["⚠️ Complaints"]
        REVIEWS["⭐ Reviews"]
        BLOGS["📝 Blogs"]
    end

    SIDEBAR --> SidebarItems
    
    PURCHASES --> PU_PAGE["PreviousPurchases"]
    COMPLAINTS --> C_PAGE["Complaints_Customer"]
    REVIEWS --> R_PAGE["Reviews"]
    BLOGS --> B_PAGE["CustomerBlogs"]
```

---

## 4. Data Flow Diagrams

### 4.1 Order Flow

```mermaid
flowchart LR
    subgraph Manager["Manager"]
        M_CREATE["Create Order"]
    end

    subgraph System["System"]
        ORDER["Order Created\n(status: pending)"]
        NOTIFY["Notify Company"]
    end

    subgraph Company["Company"]
        C_VIEW["View Order"]
        C_ACCEPT["Accept Order"]
        C_SHIP["Ship Order"]
        C_DELIVER["Mark Delivered"]
    end

    subgraph Branch["Branch"]
        B_ACCEPT["Accept Delivery"]
        INV_UPDATE["Update Inventory"]
    end

    M_CREATE --> ORDER
    ORDER --> NOTIFY
    NOTIFY --> C_VIEW
    C_VIEW --> C_ACCEPT
    C_ACCEPT -->|status: accepted| C_SHIP
    C_SHIP -->|status: shipped| C_DELIVER
    C_DELIVER -->|status: delivered| B_ACCEPT
    B_ACCEPT -->|status: accepted| INV_UPDATE
```

---

### 4.2 Sales Flow

```mermaid
flowchart LR
    subgraph Salesman["Salesman"]
        S_CREATE["Create Sale"]
        S_INVOICE["Generate Invoice"]
    end

    subgraph System["System"]
        SALE["Sale Record"]
        INV_DEC["Decrease Inventory"]
        CUSTOMER["Create/Update Customer"]
    end

    subgraph Customer["Customer"]
        C_VIEW["View Purchase"]
        C_REVIEW["Add Review/Rating"]
        C_COMPLAINT["File Complaint"]
    end

    subgraph Company["Company"]
        CO_VIEW["View Sale"]
        CO_RESPOND["Respond to Complaint"]
    end

    S_CREATE --> SALE
    SALE --> INV_DEC
    SALE --> CUSTOMER
    S_CREATE --> S_INVOICE
    
    CUSTOMER --> C_VIEW
    C_VIEW --> C_REVIEW
    C_VIEW --> C_COMPLAINT
    
    SALE --> CO_VIEW
    C_COMPLAINT --> CO_RESPOND
```

---

### 4.3 Product Approval Flow

```mermaid
flowchart LR
    subgraph Company["Company"]
        C_ADD["Add Product\n(status: Hold)"]
    end

    subgraph Owner["Owner"]
        O_REVIEW["Review Product"]
        O_ACCEPT["Accept"]
        O_REJECT["Reject"]
    end

    subgraph System["System"]
        ACCEPTED["Product Accepted\n(visible to all)"]
        REJECTED["Product Rejected\n(with reason)"]
    end

    C_ADD --> O_REVIEW
    O_REVIEW --> O_ACCEPT
    O_REVIEW --> O_REJECT
    O_ACCEPT --> ACCEPTED
    O_REJECT --> REJECTED
```

---

## 5. Schema Context & Relationships Summary

### Entity Relationships Table

| Parent Entity | Child Entity | Relationship | Foreign Key |
|--------------|--------------|--------------|-------------|
| **Branch** | Employee | One-to-Many | `Employee.bid` |
| **Branch** | Inventory | One-to-Many | `Inventory.branch_id` |
| **Branch** | Order | One-to-Many | `Order.branch_id` |
| **Branch** | Sale | One-to-Many | `Sale.branch_id` |
| **Company** | Product | One-to-Many | `Product.Com_id` |
| **Company** | Inventory | One-to-Many | `Inventory.company_id` |
| **Company** | Order | One-to-Many | `Order.company_id` |
| **Company** | Sale | One-to-Many | `Sale.company_id` |
| **Company** | Complaint | One-to-Many | `Complaint.company_id` |
| **Company** | User | One-to-One | `User.c_id` |
| **Product** | Inventory | One-to-Many | `Inventory.product_id` |
| **Product** | Order | One-to-Many | `Order.product_id` |
| **Product** | Sale | One-to-Many | `Sale.product_id` |
| **Product** | Complaint | One-to-Many | `Complaint.product_id` |
| **Employee** | Branch | One-to-One (Manager) | `Branch.manager_id` |
| **Employee** | Sale | One-to-Many | `Sale.salesman_id` |
| **Employee** | User | One-to-One | `User.emp_id` |
| **Sale** | Complaint | One-to-Many | `Complaint.sale_id` |

### Cardinality Notation
- `||--||` : One-to-One
- `||--o{` : One-to-Many (optional)
- `}o--||` : Many-to-One

---

## 6. How to Convert to Images

### Using Mermaid Live Editor
1. Go to [mermaid.live](https://mermaid.live)
2. Copy any Mermaid code block (between ```mermaid and ```)
3. Paste into the editor
4. Download as PNG/SVG

### Using VS Code Extensions
1. Install "Markdown Preview Mermaid Support" extension
2. Open this file in VS Code
3. Preview with `Ctrl+Shift+V`
4. Right-click diagrams to save as images

### Using CLI (mermaid-cli)
```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i ER_Diagrams_and_Wireframes.md -o output.png
```

### Using GitHub
GitHub automatically renders Mermaid diagrams in markdown files. Just push this file to your repository.

---

## 7. Quick Reference - All Schemas

| Schema | Primary Key | Main References |
|--------|-------------|-----------------|
| Branch | `bid` | → Employee (manager) |
| Company | `c_id` | - |
| Complaint | `complaint_id` | → Sale, Product, Company |
| Customer | `customer_id` | - |
| Employee | `e_id` | → Branch |
| Inventory | Compound (`branch_id`, `product_id`, `company_id`) | → Branch, Product, Company |
| Message | - | → Branch, Company, Employee (optional) |
| Order | `order_id` | → Branch, Company, Product |
| Product | `prod_id` | → Company |
| Sale | `sales_id` | → Branch, Employee, Company, Product |
| User | `userId` | → Employee OR Company |
