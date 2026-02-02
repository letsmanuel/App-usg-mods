
INSERT INTO moderators (roblox_id, roblox_username, is_system_admin) VALUES 
('0', 'psProduktion', 1),
('1', 'toni08072', 1);

INSERT INTO roblox_users (roblox_id, roblox_username) VALUES
('100', 'PlayerOne'),
('101', 'PlayerTwo'),
('102', 'PlayerThree');

INSERT INTO violations (roblox_user_id, violation_text, status) VALUES
('100', 'Used inappropriate language in chat', 'pending'),
('100', 'Spammed messages repeatedly', 'pending'),
('101', 'Exploited game mechanics', 'pending'),
('102', 'Harassed other players', 'guilty'),
('102', 'Created offensive content', 'guilty');
