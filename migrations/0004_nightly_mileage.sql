-- Mark delivered routes after their mileage has been applied to the vehicle.
ALTER TABLE fleet_routes ADD COLUMN mileage_applied_at DATETIME;
