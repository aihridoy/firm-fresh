# Admin Role Implementation Plan

## Current State
- User model: `userType` enum is `["customer", "farmer"]` — no admin
- Auth middleware: `isFarmer`, `isCustomer` — no `isAdmin`
- Navbar: shows role badge as "Farmer" or "Customer" — no admin handling
- User slice TypeScript type: `userType: "customer" | "farmer"` — no admin
- No admin routes, controllers, or pages exist

## Admin Credentials
- Email: `aihridoy976@gmail.com`
- Password: `Ash@358241`
- Must be seeded into DB and excluded from normal user deletion

---

## Phase 1: Backend — Model & Middleware Changes

### 1.1 Update User Model (`apps/server/models/userModel.js`)
- Add `"admin"` to the `userType` enum: `["customer", "farmer", "admin"]`
- Admin users should NOT have required `farmerDetails` — add condition:
  ```js
  required: function () {
    return this.userType === "farmer";
  }
  ```
  (already exists, just verify it works for admin too — admin should not need farm details)

### 1.2 Add `isAdmin` Middleware (`apps/server/middleware/authMiddleware.js`)
```js
exports.isAdmin = (req, res, next) => {
  if (req.user.userType !== "admin") {
    return res.status(403).send({
      status: false,
      error: "Access denied. Only admins can access this resource.",
    });
  }
  next();
};
```

### 1.3 Seed Admin User (`apps/server/scripts/seed.ts` or new `seedAdmin` function)
- Create admin user with:
  - `userType: "admin"`
  - `firstName: "Admin"`
  - `lastName: "User"`
  - `email: "aihridoy976@gmail.com"`
  - `password: "Ash@358241"`
  - `phone: "01700000000"`
  - `address: "Dhaka, Bangladesh"`
  - No `farmerDetails`
- Run as part of seed or as a separate script
- Prevent this user from being deleted via admin user management

---

## Phase 2: Backend — Admin API Routes

### 2.1 Admin Routes (`apps/server/routes/adminRoute.js`)
All routes prefixed with `/api/admin` and protected by `authMiddleware` + `isAdmin`.

**Dashboard:**
- `GET /api/admin/dashboard` — Aggregate stats: total users (by role), total products, total orders, total revenue, recent orders, recent users

**User Management:**
- `GET /api/admin/users` — List all users (paginated, filterable by role, searchable)
- `GET /api/admin/users/:id` — Get single user details
- `PUT /api/admin/users/:id` — Update user (admin can change role, suspend, etc.)
- `DELETE /api/admin/users/:id` — Delete user (prevent deleting self or other admins)

**Product Management:**
- `GET /api/admin/products` — List all products (paginated, filterable by category, farmer, status)
- `GET /api/admin/products/:id` — Get single product details
- `DELETE /api/admin/products/:id` — Delete any product (admin override)
- `PATCH /api/admin/products/:id/publish` — Toggle publish status for any product

**Order Management:**
- `GET /api/admin/orders` — List all orders (paginated, filterable by status)
- `GET /api/admin/orders/:id` — Get single order details
- `PATCH /api/admin/orders/:id/status` — Update order status (admin override)

### 2.2 Register Admin Routes in `apps/server/index.js`
```js
const adminRoutes = require("./routes/adminRoute");
app.use("/api", adminRoutes);
```

---

## Phase 3: Frontend — Admin Pages

### 3.1 Admin Layout (`apps/client/app/(admin)/layout.tsx`)
- Separate layout group for admin pages
- Includes Navbar + admin sidebar navigation
- Route protection: redirect to `/` if user is not admin

### 3.2 Admin Dashboard (`apps/client/app/(admin)/dashboard/page.tsx`)
- Stats cards: Total Users, Total Farmers, Total Customers, Total Products, Total Orders, Total Revenue
- Recent orders table (last 10)
- Recent users table (last 10)
- Quick action buttons

### 3.3 Admin Users Page (`apps/client/app/(admin)/users/page.tsx`)
- Table: Name, Email, Phone, Role, Created At, Actions
- Search by name/email
- Filter by role (All, Customer, Farmer, Admin)
- Actions: View details, Change role dropdown, Delete (with confirmation modal)
- Pagination

### 3.4 Admin Products Page (`apps/client/app/(admin)/products/page.tsx`)
- Table: Product Name, Farmer, Category, Price, Stock, Published status, Actions
- Search by product name
- Filter by category, farmer, publish status
- Actions: View details, Toggle publish, Delete (with confirmation modal)
- Pagination

### 3.5 Admin Orders Page (`apps/client/app/(admin)/orders/page.tsx`)
- Table: Order ID, Customer, Total, Status, Date, Actions
- Filter by status (All, Pending, Confirmed, Shipped, Delivered, Canceled)
- Actions: View details, Change status dropdown
- Pagination

---

## Phase 4: Frontend — Navbar & Auth Updates

### 4.1 Update User Type (`apps/client/lib/api/endpoints/userSlice.ts`)
- Change: `userType: "customer" | "farmer"` → `userType: "customer" | "farmer" | "admin"`

### 4.2 Update Navbar (`apps/client/components/Navbar.tsx`)
- Add admin role badge: red "Admin" badge
- Add admin menu items:
  - Dashboard (→ `/admin/dashboard`)
  - Manage Users (→ `/admin/users`)
  - Manage Products (→ `/admin/products`)
  - Manage Orders (→ `/admin/orders`)
- Admin sees ALL nav items (Home + admin links)

### 4.3 Route Protection
- Admin pages must check `user.userType === "admin"` on mount
- Redirect non-admins to `/` with error message
- Can use a simple wrapper component or middleware

---

## Phase 5: Seed & Testing

### 5.1 Update Seed Script
- Add admin user creation to the seed script
- Run `npx tsx scripts/seed.ts` to create admin + all farmers/products

### 5.2 Test Checklist
- [ ] Admin can login with aihridoy976@gmail.com / Ash@358241
- [ ] Admin sees red "Admin" badge in navbar
- [ ] Admin navbar shows: Dashboard, Manage Users, Manage Products, Manage Orders
- [ ] Dashboard shows correct stats
- [ ] Admin can view/edit/delete any user
- [ ] Admin can view/toggle publish/delete any product
- [ ] Admin can view/update status of any order
- [ ] Admin cannot be deleted by themselves or other admins
- [ ] Non-admin users cannot access /admin/* routes (redirected to /)
- [ ] Farmer and Customer pages still work correctly
