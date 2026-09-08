-- Electronic proof of delivery photo metadata and payload.
ALTER TABLE route_activity_history ADD COLUMN proof_photo_data TEXT;
ALTER TABLE route_activity_history ADD COLUMN proof_photo_name TEXT;
ALTER TABLE route_activity_history ADD COLUMN proof_photo_type TEXT;
