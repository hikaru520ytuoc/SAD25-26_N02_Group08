fix(validation): add manual eligibility data and council scheduling constraints

- Add manual academic eligibility fields to students and student_eligibilities
- Add migration for completed credits, required credits, GPA/CPA, prerequisite debt, tuition debt and disciplinary status
- Add reusable eligibility evaluation utility with automatic ELIGIBLE/NOT_ELIGIBLE calculation
- Update student eligibility create/update workflow to validate internship, academic status, credits, GPA/CPA, debt and discipline conditions
- Update topic registration eligibility guard to re-check detailed academic conditions before allowing registration
- Update admin user creation to create student profile and eligibility record when role STUDENT is selected
- Update frontend admin user form to collect manual student academic data during account creation
- Update faculty eligibility form and table to display detailed academic eligibility data
- Enforce maximum 6 topics per council when creating/updating defense schedules
- Enforce 4 to 6 topics when closing a defense council
- Add defense schedule conflict validation for shared council members across different councils
- Keep existing room and council time conflict validation
