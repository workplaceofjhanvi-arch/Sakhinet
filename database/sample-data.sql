insert into colleges (id, name, email_domain) values
('11111111-1111-1111-1111-111111111111', 'Demo College', 'demo.edu')
on conflict (id) do nothing;

insert into users (id, college_id, name, email) values
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Requester Demo', 'requester@demo.edu'),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Volunteer Demo', 'volunteer@demo.edu')
on conflict (id) do nothing;

insert into washrooms (id, college_id, name, has_water, has_dustbin, has_lock, has_pads, rating) values
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Library Block Washroom', true, true, true, false, 4),
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Hostel Block Washroom', true, false, true, true, 3.5)
on conflict (id) do nothing;

insert into dispensers (id, college_id, location, stock_level) values
('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'Main Block', 12)
on conflict (id) do nothing;
