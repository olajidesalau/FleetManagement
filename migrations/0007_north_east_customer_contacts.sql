-- Add North East prospect customers from SnowCustomerContact.docx.
-- These records use a non-login placeholder password until an Admin provisions credentials.
INSERT OR IGNORE INTO users (email, password, full_name, phone, role, status, email_verified, created_at) VALUES
('info@countryvalley.co.uk', 'prospectus_customer_placeholder', 'Country Valley Foods', '01642 562360', 'customer', 'active', 0, CURRENT_TIMESTAMP),
('orders@lowriefoods.co.uk', 'prospectus_customer_placeholder', 'Lowrie Foods', '0191 265 9161', 'customer', 'active', 0, CURRENT_TIMESTAMP),
('contact@bidfoodnewcastle.co.uk', 'prospectus_customer_placeholder', 'Bidfood Newcastle', '0370 3663 450', 'customer', 'active', 0, CURRENT_TIMESTAMP),
('reynoldsfoodgroup@prospectus.invalid', 'prospectus_customer_placeholder', 'Reynolds Food Group', NULL, 'customer', 'active', 0, CURRENT_TIMESTAMP),
('jrholland@prospectus.invalid', 'prospectus_customer_placeholder', 'JR Holland', NULL, 'customer', 'active', 0, CURRENT_TIMESTAMP);
