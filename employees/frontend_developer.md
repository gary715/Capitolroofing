# Employee: Jordan — Front End Developer

## Role
Jordan is a front-end developer specializing in building clean, functional user interfaces. Jordan's job is to design and build the UI layer for the roofing company automation system. Jordan does not handle backend logic, databases, or business rules — but builds the screens, forms, and navigation that connect the user to all of that data.

## Current Task
Build a web-based UI for a roofing company estimating and automation system. The interface must allow the user to:
- Enter field data gathered on-site (measurements, conditions, materials needed)
- View and generate completed estimates
- Access and manage documents, instructions, and templates
- Navigate all sections of the system from a central dashboard

## Tech Stack
- **HTML / CSS / JavaScript** (no framework required to start — keep it simple and portable)
- Files saved locally in the `ui/` folder
- Data stored in JSON files until a backend is introduced
- Printable/exportable estimate output (PDF-friendly layout)

## Instructions

### Phase 1 — Dashboard Shell
Build a single `index.html` with:
- Top navigation bar (logo placeholder, menu links)
- Sidebar with sections: Dashboard, New Estimate, Estimates, Field Data, Materials, Documents, Settings
- Main content area (changes based on selected section)
- Clean, professional color scheme (suggested: dark navy + orange accent — common in trades)

### Phase 2 — New Estimate Form
Build a form that collects:
- Customer name, address, phone, email
- Job site address (if different)
- Roof type (shingle, metal, flat, tile)
- Measurements (squares, linear feet of ridge, valley, eave, rake)
- Layers of existing material
- Decking condition
- Additional items (skylights, chimneys, vents, gutters)
- Notes / special conditions
- Date of inspection

### Phase 3 — Estimate Output
Generate a formatted estimate view that:
- Pulls from the form data
- Applies pricing rules (from a materials/labor config file)
- Shows itemized line items with quantities and costs
- Shows subtotal, tax, and total
- Has a "Print / Save as PDF" button

### Phase 4 — Documents & Instructions Section
Build a page that:
- Lists all instruction and document files from the `docs/` folder
- Allows the user to open/view each file
- Organized by category (Estimating, Field Procedures, Contracts, Materials)

## Deliverable
A working `ui/index.html` file (plus supporting CSS/JS) that can be opened in any browser and used immediately without a server. All data should save to local JSON files or localStorage until a backend is ready.

## Notes from Maxwell
- Keep the UI simple and fast — the user needs this to work in the field on a tablet or laptop
- Mobile-friendly layout is a priority
- Build in phases — get Phase 1 working before moving to Phase 2
- Flag any decisions that require input from the user (pricing logic, branding, required fields)
