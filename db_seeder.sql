-- ==========================================
-- LEVEL 1: CATEGORIES (Safe to rerun)
-- ==========================================
INSERT INTO tags_tag (id, name, slug, level, parent_id)
VALUES 
('c1111111-1111-4111-8111-111111111111', 'Science', 'science', 'category', NULL),
('c2222222-2222-4222-8222-222222222222', 'Technology', 'technology', 'category', NULL),
('c3333333-3333-4333-8333-333333333333', 'Engineering', 'engineering', 'category', NULL),
('c4444444-4444-4444-8444-444444444444', 'Mathematics', 'mathematics', 'category', NULL)
ON CONFLICT (id) DO NOTHING;


-- ==========================================
-- LEVEL 2: SUBCATEGORIES (Fixed UUID Hex Strings)
-- ==========================================
INSERT INTO tags_tag (id, name, slug, level, parent_id)
VALUES 
-- Science Subcategories
('b1111111-1111-4111-8111-111111111111', 'Physics', 'physics', 'subcategory', 'c1111111-1111-4111-8111-111111111111'),
('b1111111-2222-4111-8111-111111111112', 'Chemistry', 'chemistry', 'subcategory', 'c1111111-1111-4111-8111-111111111111'),
('b1111111-3333-4111-8111-111111111113', 'Biology', 'biology', 'subcategory', 'c1111111-1111-4111-8111-111111111111'),
('b1111111-4444-4111-8111-111111111114', 'Astronomy', 'astronomy', 'subcategory', 'c1111111-1111-4111-8111-111111111111'),

-- Technology Subcategories (EXPANDED)
('b2222222-1111-4222-8222-222222222221', 'Computer Science', 'computer-science', 'subcategory', 'c2222222-2222-4222-8222-222222222222'),
('b2222222-2222-4222-8222-222222222222', 'Cybersecurity', 'cybersecurity', 'subcategory', 'c2222222-2222-4222-8222-222222222222'),
('b2222222-3333-4222-8222-222222222223', 'Data Science & AI', 'data-science-ai', 'subcategory', 'c2222222-2222-4222-8222-222222222222'),
('b2222222-4444-4222-8222-222222222224', 'Web Development', 'web-development', 'subcategory', 'c2222222-2222-4222-8222-222222222222'),
('b2222222-5555-4222-8222-222222222225', 'Cloud Computing', 'cloud-computing', 'subcategory', 'c2222222-2222-4222-8222-222222222222'),
('b2222222-6666-4222-8222-222222222226', 'DevOps & Infrastructure', 'devops-infrastructure', 'subcategory', 'c2222222-2222-4222-8222-222222222222'),

-- Engineering Subcategories
('b3333333-1111-4333-8333-333333333331', 'Mechanical Engineering', 'mechanical-engineering', 'subcategory', 'c3333333-3333-4333-8333-333333333333'),
('b3333333-2222-4333-8333-333333333332', 'Electrical Engineering', 'electrical-engineering', 'subcategory', 'c3333333-3333-4333-8333-333333333333'),
('b3333333-3333-4333-8333-333333333333', 'Civil Engineering', 'civil-engineering', 'subcategory', 'c3333333-3333-4333-8333-333333333333'),
('b3333333-4444-4333-8333-333333333334', 'Aerospace Engineering', 'aerospace-engineering', 'subcategory', 'c3333333-3333-4333-8333-333333333333'),

-- Mathematics Subcategories (EXPANDED)
('b4444444-1111-4444-8444-444444444441', 'Calculus', 'calculus', 'subcategory', 'c4444444-4444-4444-8444-444444444444'),
('b4444444-2222-4444-8444-444444444442', 'Algebra', 'algebra', 'subcategory', 'c4444444-4444-4444-8444-444444444444'),
('b4444444-3333-4444-8444-444444444443', 'Statistics & Probability', 'statistics-probability', 'subcategory', 'c4444444-4444-4444-8444-444444444444'),
('b4444444-4444-4444-8444-444444444444', 'Discrete Mathematics', 'discrete-mathematics', 'subcategory', 'c4444444-4444-4444-8444-444444444444'),
('b4444444-5555-4444-8444-444444444445', 'Geometry & Topology', 'geometry-topology', 'subcategory', 'c4444444-4444-4444-8444-444444444444'),
('b4444444-6666-4444-8444-444444444446', 'Number Theory', 'number-theory', 'subcategory', 'c4444444-4444-4444-8444-444444444444')
ON CONFLICT (id) DO NOTHING;


-- ==========================================
-- LEVEL 3: LEAF TAGS 
-- ==========================================

-- --- SCIENCE TAGS ---
INSERT INTO tags_tag (id, name, slug, level, parent_id) VALUES 
(gen_random_uuid(), 'Newtonian Mechanics', 'newtonian-mechanics', 'tag', 'b1111111-1111-4111-8111-111111111111'),
(gen_random_uuid(), 'Thermodynamics', 'thermodynamics', 'tag', 'b1111111-1111-4111-8111-111111111111'),
(gen_random_uuid(), 'Quantum Mechanics', 'quantum-mechanics', 'tag', 'b1111111-1111-4111-8111-111111111111'),
(gen_random_uuid(), 'Organic Chemistry', 'organic-chemistry', 'tag', 'b1111111-2222-4111-8111-111111111112'),
(gen_random_uuid(), 'Stoichiometry', 'stoichiometry', 'tag', 'b1111111-2222-4111-8111-111111111112'),
(gen_random_uuid(), 'Cellular Respiration', 'cellular-respiration', 'tag', 'b1111111-3333-4111-8111-111111111113'),
(gen_random_uuid(), 'Genetics & DNA', 'genetics-dna', 'tag', 'b1111111-3333-4111-8111-111111111113'),
(gen_random_uuid(), 'Astrophysics', 'astrophysics', 'tag', 'b1111111-4444-4111-8111-111111111114');

-- --- TECHNOLOGY TAGS (DEEP HITS) ---
-- Computer Science
INSERT INTO tags_tag (id, name, slug, level, parent_id) VALUES 
(gen_random_uuid(), 'Data Structures', 'data-structures', 'tag', 'b2222222-1111-4222-8222-222222222221'),
(gen_random_uuid(), 'Algorithms', 'algorithms', 'tag', 'b2222222-1111-4222-8222-222222222221'),
(gen_random_uuid(), 'Memory Management', 'memory-management', 'tag', 'b2222222-1111-4222-8222-222222222221'),
(gen_random_uuid(), 'Compilers', 'compilers', 'tag', 'b2222222-1111-4222-8222-222222222221'),
(gen_random_uuid(), 'Asynchronous Programming', 'asynchronous-programming', 'tag', 'b2222222-1111-4222-8222-222222222221');

-- Cybersecurity
INSERT INTO tags_tag (id, name, slug, level, parent_id) VALUES 
(gen_random_uuid(), 'Cryptography', 'cryptography', 'tag', 'b2222222-2222-4222-8222-222222222222'),
(gen_random_uuid(), 'Network Security', 'network-security', 'tag', 'b2222222-2222-4222-8222-222222222222'),
(gen_random_uuid(), 'Penetration Testing', 'penetration-testing', 'tag', 'b2222222-2222-4222-8222-222222222222'),
(gen_random_uuid(), 'Zero Trust Architecture', 'zero-trust-architecture', 'tag', 'b2222222-2222-4222-8222-222222222222');

-- Data Science & AI
INSERT INTO tags_tag (id, name, slug, level, parent_id) VALUES 
(gen_random_uuid(), 'Machine Learning', 'machine-learning', 'tag', 'b2222222-3333-4222-8222-222222222223'),
(gen_random_uuid(), 'Deep Learning', 'deep-learning', 'tag', 'b2222222-3333-4222-8222-222222222223'),
(gen_random_uuid(), 'Neural Networks', 'neural-networks', 'tag', 'b2222222-3333-4222-8222-222222222223'),
(gen_random_uuid(), 'Natural Language Processing', 'natural-language-processing', 'tag', 'b2222222-3333-4222-8222-222222222223'),
(gen_random_uuid(), 'Computer Vision', 'computer-vision', 'tag', 'b2222222-3333-4222-8222-222222222223');

-- Web Development
INSERT INTO tags_tag (id, name, slug, level, parent_id) VALUES 
(gen_random_uuid(), 'Backend Development', 'backend-development', 'tag', 'b2222222-4444-4222-8222-222222222224'),
(gen_random_uuid(), 'Frontend Frameworks', 'frontend-frameworks', 'tag', 'b2222222-4444-4222-8222-222222222224'),
(gen_random_uuid(), 'RESTful APIs', 'restful-apis', 'tag', 'b2222222-4444-4222-8222-222222222224'),
(gen_random_uuid(), 'WebSockets', 'websockets', 'tag', 'b2222222-4444-4222-8222-222222222224');

-- Cloud Computing
INSERT INTO tags_tag (id, name, slug, level, parent_id) VALUES 
(gen_random_uuid(), 'AWS', 'aws', 'tag', 'b2222222-5555-4222-8222-222222222225'),
(gen_random_uuid(), 'Serverless Architecture', 'serverless-architecture', 'tag', 'b2222222-5555-4222-8222-222222222225'),
(gen_random_uuid(), 'Multi-Cloud Strategy', 'multi-cloud-strategy', 'tag', 'b2222222-5555-4222-8222-222222222225'),
(gen_random_uuid(), 'Virtual Private Cloud', 'virtual-private-cloud', 'tag', 'b2222222-5555-4222-8222-222222222225');

-- DevOps & Infrastructure
INSERT INTO tags_tag (id, name, slug, level, parent_id) VALUES 
(gen_random_uuid(), 'CI/CD Pipelines', 'cicd-pipelines', 'tag', 'b2222222-6666-4222-8222-222222222226'),
(gen_random_uuid(), 'Infrastructure as Code', 'infrastructure-as-code', 'tag', 'b2222222-6666-4222-8222-222222222226'),
(gen_random_uuid(), 'Docker Containers', 'docker-containers', 'tag', 'b2222222-6666-4222-8222-222222222226'),
(gen_random_uuid(), 'Kubernetes Orchestration', 'kubernetes-orchestration', 'tag', 'b2222222-6666-4222-8222-222222222226');


-- --- ENGINEERING TAGS ---
INSERT INTO tags_tag (id, name, slug, level, parent_id) VALUES 
(gen_random_uuid(), 'Fluid Dynamics', 'fluid-dynamics', 'tag', 'b3333333-1111-4333-8333-333333333331'),
(gen_random_uuid(), 'Kinematics', 'kinematics', 'tag', 'b3333333-1111-4333-8333-333333333331'),
(gen_random_uuid(), 'Circuit Analysis', 'circuit-analysis', 'tag', 'b3333333-2222-4333-8333-333333333332'),
(gen_random_uuid(), 'Structural Analysis', 'structural-analysis', 'tag', 'b3333333-3333-4333-8333-333333333333'),
(gen_random_uuid(), 'Aerodynamics', 'aerodynamics', 'tag', 'b3333333-4444-4333-8333-333333333334');


-- --- MATHEMATICS TAGS (DEEP HITS) ---
-- Calculus
INSERT INTO tags_tag (id, name, slug, level, parent_id) VALUES 
(gen_random_uuid(), 'Integral Calculus', 'integral-calculus', 'tag', 'b4444444-1111-4444-8444-444444444441'),
(gen_random_uuid(), 'Limits', 'limits', 'tag', 'b4444444-1111-4444-8444-444444444441'),
(gen_random_uuid(), 'Chain Rule', 'chain-rule', 'tag', 'b4444444-1111-4444-8444-444444444441'),
(gen_random_uuid(), 'Differential Equations', 'differential-equations', 'tag', 'b4444444-1111-4444-8444-444444444441'),
(gen_random_uuid(), 'Multivariable Calculus', 'multivariable-calculus', 'tag', 'b4444444-1111-4444-8444-444444444441'),
(gen_random_uuid(), 'Taylor Series', 'taylor-series', 'tag', 'b4444444-1111-4444-8444-444444444441');

-- Algebra
INSERT INTO tags_tag (id, name, slug, level, parent_id) VALUES 
(gen_random_uuid(), 'Linear Algebra', 'linear-algebra', 'tag', 'b4444444-2222-4444-8444-444444444442'),
(gen_random_uuid(), 'Matrix Operations', 'matrix-operations', 'tag', 'b4444444-2222-4444-8444-444444444442'),
(gen_random_uuid(), 'Eigenvalues & Eigenvectors', 'eigenvalues-eigenvectors', 'tag', 'b4444444-2222-4444-8444-444444444442'),
(gen_random_uuid(), 'Quadratic Equations', 'quadratic-equations', 'tag', 'b4444444-2222-4444-8444-444444444442'),
(gen_random_uuid(), 'Vector Spaces', 'vector-spaces', 'tag', 'b4444444-2222-4444-8444-444444444442');

-- Statistics & Probability
INSERT INTO tags_tag (id, name, slug, level, parent_id) VALUES 
(gen_random_uuid(), 'Bayesian Inference', 'bayesian-inference', 'tag', 'b4444444-3333-4444-8444-444444444443'),
(gen_random_uuid(), 'Hypothesis Testing', 'hypothesis-testing', 'tag', 'b4444444-3333-4444-8444-444444444443'),
(gen_random_uuid(), 'Probability Distributions', 'probability-distributions', 'tag', 'b4444444-3333-4444-8444-444444444443'),
(gen_random_uuid(), 'Regression Analysis', 'regression-analysis', 'tag', 'b4444444-3333-4444-8444-444444444443'),
(gen_random_uuid(), 'Central Limit Theorem', 'central-limit-theorem', 'tag', 'b4444444-3333-4444-8444-444444444443'),
(gen_random_uuid(), 'Markov Chains', 'markov-chains', 'tag', 'b4444444-3333-4444-8444-444444444443');

-- Discrete Mathematics
INSERT INTO tags_tag (id, name, slug, level, parent_id) VALUES 
(gen_random_uuid(), 'Graph Theory', 'graph-theory', 'tag', 'b4444444-4444-4444-8444-444444444444'),
(gen_random_uuid(), 'Combinatorics', 'combinatorics', 'tag', 'b4444444-4444-4444-8444-444444444444'),
(gen_random_uuid(), 'Set Theory', 'set-theory', 'tag', 'b4444444-4444-4444-8444-444444444444'),
(gen_random_uuid(), 'Boolean Algebra', 'boolean-algebra', 'tag', 'b4444444-4444-4444-8444-444444444444'),
(gen_random_uuid(), 'Recurrence Relations', 'recurrence-relations', 'tag', 'b4444444-4444-4444-8444-444444444444');

-- Geometry & Topology
INSERT INTO tags_tag (id, name, slug, level, parent_id) VALUES 
(gen_random_uuid(), 'Euclidean Geometry', 'euclidean-geometry', 'tag', 'b4444444-5555-4444-8444-444444444445'),
(gen_random_uuid(), 'Differential Geometry', 'differential-geometry', 'tag', 'b4444444-5555-4444-8444-444444444445'),
(gen_random_uuid(), 'Algebraic Topology', 'algebraic-topology', 'tag', 'b4444444-5555-4444-8444-444444444445'),
(gen_random_uuid(), 'Manifolds', 'manifolds', 'tag', 'b4444444-5555-4444-8444-444444444445');

-- Number Theory
INSERT INTO tags_tag (id, name, slug, level, parent_id) VALUES 
(gen_random_uuid(), 'Prime Numbers', 'prime-numbers', 'tag', 'b4444444-6666-4444-8444-444444444446'),
(gen_random_uuid(), 'Modular Arithmetic', 'modular-arithmetic', 'tag', 'b4444444-6666-4444-8444-444444444446'),
(gen_random_uuid(), 'Fermats Last Theorem', 'fermats-last-theorem', 'tag', 'b4444444-6666-4444-8444-444444444446'),
(gen_random_uuid(), 'Riemann Hypothesis', 'riemann-hypothesis', 'tag', 'b4444444-6666-4444-8444-444444444446'),
(gen_random_uuid(), 'Diophantine Equations', 'diophantine-equations', 'tag', 'b4444444-6666-4444-8444-444444444446');

-- ============================================================
-- Demo / seed data
-- Generated 2026-07-03T09:00:00
--
-- Prerequisites: run your existing tags_tag seed file FIRST
-- (categories + subcategories + leaf tags) -- this script references
-- leaf/subcategory tags by slug via subqueries, it does not re-insert them.
--
-- NOTE ON "study groups": no StudyGroup model was provided in the
-- uploaded files -- ChatMessage.group_id and Notification.payload's
-- group_id are plain UUID/JSON fields with no FK to a groups table.
-- This script simulates 4 study groups as fixed UUIDs used consistently
-- across chat_chatmessage and notifications_notification:
--   algo-study-group: 5491b699-f262-4261-a0c5-f1cb7d5073da
--   ml-ai-circle: a2f3b464-cd22-427f-bff0-a5b4659c8d30
--   security-ctf-crew: d08df352-0fd2-44fe-8187-6d3af1904da7
--   calc-stats-support: dc2b97aa-aff8-4b5d-bc7f-36892753d70e
-- If you do have a real StudyGroup/Membership model, share it and this
-- can be wired up properly with real group rows + membership rows.
--
-- All demo users share the placeholder password hash below purely so the
-- rows are well-formed; it does NOT correspond to a real usable password.
-- Reset passwords via manage.py before actually logging in as any of them.
-- ============================================================

BEGIN;

-- users_user: 18 rows
INSERT INTO users_user (id, password, email, first_name, last_name, role, bio, streak_count, points_total, rank_position, date_joined, is_active, is_staff, is_superuser)
VALUES
    (1, 'pbkdf2_sha256$600000$demoseeddata$Xk3mQvN7pLZs9hR2wYtCq1uJdA6bFnEoTgVxHiKpMrWs=', 'grace.wanjiru@strathmore.edu', 'Grace', 'Wanjiru', 'student', 'Second-year CS student, loves algorithms and competitive programming.', 20, 0, 0, '2026-05-06T09:00:00', TRUE, FALSE, FALSE),
    (2, 'pbkdf2_sha256$600000$demoseeddata$Xk3mQvN7pLZs9hR2wYtCq1uJdA6bFnEoTgVxHiKpMrWs=', 'brian.otieno@strathmore.edu', 'Brian', 'Otieno', 'expert_solver', 'TA for Data Structures & Algorithms. Answers CS questions in my sleep.', 0, 0, 0, '2025-11-26T09:00:00', TRUE, FALSE, FALSE),
    (3, 'pbkdf2_sha256$600000$demoseeddata$Xk3mQvN7pLZs9hR2wYtCq1uJdA6bFnEoTgVxHiKpMrWs=', 'faith.mwangi@ku.edu', 'Faith', 'Mwangi', 'student', 'Math major, currently drowning in real analysis.', 8, 0, 0, '2026-04-02T09:00:00', TRUE, FALSE, FALSE),
    (4, 'pbkdf2_sha256$600000$demoseeddata$Xk3mQvN7pLZs9hR2wYtCq1uJdA6bFnEoTgVxHiKpMrWs=', 'kevin.kiptoo@ku.edu', 'Kevin', 'Kiptoo', 'expert_solver', 'Grad student in applied mathematics, calculus and linear algebra tutor.', 7, 0, 0, '2026-04-29T09:00:00', TRUE, FALSE, FALSE),
    (5, 'pbkdf2_sha256$600000$demoseeddata$Xk3mQvN7pLZs9hR2wYtCq1uJdA6bFnEoTgVxHiKpMrWs=', 'mercy.achieng@cuea.edu', 'Mercy', 'Achieng', 'student', 'Studying computer science, into web dev and UI design.', 3, 0, 0, '2025-12-12T09:00:00', TRUE, FALSE, FALSE),
    (6, 'pbkdf2_sha256$600000$demoseeddata$Xk3mQvN7pLZs9hR2wYtCq1uJdA6bFnEoTgVxHiKpMrWs=', 'dennis.mutua@cuea.edu', 'Dennis', 'Mutua', 'student', 'First year engineering student, still finding my footing.', 17, 0, 0, '2026-05-12T09:00:00', TRUE, FALSE, FALSE),
    (7, 'pbkdf2_sha256$600000$demoseeddata$Xk3mQvN7pLZs9hR2wYtCq1uJdA6bFnEoTgVxHiKpMrWs=', 'sarah.njeri@google.com', 'Sarah', 'Njeri', 'expert_solver', 'ML engineer, mentoring students on the side.', 18, 0, 0, '2026-02-15T09:00:00', TRUE, FALSE, FALSE),
    (8, 'pbkdf2_sha256$600000$demoseeddata$Xk3mQvN7pLZs9hR2wYtCq1uJdA6bFnEoTgVxHiKpMrWs=', 'james.kariuki@google.com', 'James', 'Kariuki', 'student', 'SWE intern, brushing up on distributed systems and cloud.', 1, 0, 0, '2026-05-27T09:00:00', TRUE, FALSE, FALSE),
    (9, 'pbkdf2_sha256$600000$demoseeddata$Xk3mQvN7pLZs9hR2wYtCq1uJdA6bFnEoTgVxHiKpMrWs=', 'linda.adhiambo@strathmore.edu', 'Linda', 'Adhiambo', 'student', 'Physics major with a growing interest in quantum computing.', 2, 0, 0, '2026-04-09T09:00:00', TRUE, FALSE, FALSE),
    (10, 'pbkdf2_sha256$600000$demoseeddata$Xk3mQvN7pLZs9hR2wYtCq1uJdA6bFnEoTgVxHiKpMrWs=', 'peter.omondi@ku.edu', 'Peter', 'Omondi', 'student', 'Statistics student, enjoys Bayesian methods.', 7, 0, 0, '2026-01-25T09:00:00', TRUE, FALSE, FALSE),
    (11, 'pbkdf2_sha256$600000$demoseeddata$Xk3mQvN7pLZs9hR2wYtCq1uJdA6bFnEoTgVxHiKpMrWs=', 'ann.wambui@cuea.edu', 'Ann', 'Wambui', 'expert_solver', 'Data science tutor, ex-actuarial science student.', 19, 0, 0, '2026-05-28T09:00:00', TRUE, FALSE, FALSE),
    (12, 'pbkdf2_sha256$600000$demoseeddata$Xk3mQvN7pLZs9hR2wYtCq1uJdA6bFnEoTgVxHiKpMrWs=', 'michael.ouma@strathmore.edu', 'Michael', 'Ouma', 'student', 'Cybersecurity enthusiast, runs CTFs on weekends.', 17, 0, 0, '2026-04-14T09:00:00', TRUE, FALSE, FALSE),
    (13, 'pbkdf2_sha256$600000$demoseeddata$Xk3mQvN7pLZs9hR2wYtCq1uJdA6bFnEoTgVxHiKpMrWs=', 'cynthia.wafula@google.com', 'Cynthia', 'Wafula', 'student', 'Backend engineer intern, learning Kubernetes properly.', 20, 0, 0, '2025-12-06T09:00:00', TRUE, FALSE, FALSE),
    (14, 'pbkdf2_sha256$600000$demoseeddata$Xk3mQvN7pLZs9hR2wYtCq1uJdA6bFnEoTgVxHiKpMrWs=', 'josephat.ngugi@ku.edu', 'Josephat', 'Ngugi', 'expert_solver', 'Security researcher, loves cryptography puzzles.', 17, 0, 0, '2026-02-16T09:00:00', TRUE, FALSE, FALSE),
    (15, 'pbkdf2_sha256$600000$demoseeddata$Xk3mQvN7pLZs9hR2wYtCq1uJdA6bFnEoTgVxHiKpMrWs=', 'purity.chebet@cuea.edu', 'Purity', 'Chebet', 'student', 'Engineering student focusing on structural analysis.', 7, 0, 0, '2026-02-09T09:00:00', TRUE, FALSE, FALSE),
    (16, 'pbkdf2_sha256$600000$demoseeddata$Xk3mQvN7pLZs9hR2wYtCq1uJdA6bFnEoTgVxHiKpMrWs=', 'daniel.mwai@strathmore.edu', 'Daniel', 'Mwai', 'student', 'Self-taught developer, currently obsessed with async programming.', 18, 0, 0, '2026-03-24T09:00:00', TRUE, FALSE, FALSE),
    (17, 'pbkdf2_sha256$600000$demoseeddata$Xk3mQvN7pLZs9hR2wYtCq1uJdA6bFnEoTgVxHiKpMrWs=', 'esther.nyambura@google.com', 'Esther', 'Nyambura', 'expert_solver', 'Frontend/infra hybrid, answers web + devops questions.', 0, 0, 0, '2025-11-21T09:00:00', TRUE, FALSE, FALSE),
    (18, 'pbkdf2_sha256$600000$demoseeddata$Xk3mQvN7pLZs9hR2wYtCq1uJdA6bFnEoTgVxHiKpMrWs=', 'collins.barasa@ku.edu', 'Collins', 'Barasa', 'student', 'Discrete math and graph theory nerd.', 5, 0, 0, '2025-12-07T09:00:00', TRUE, FALSE, FALSE)
;

-- users_user_subjects (M2M): 22 rows
INSERT INTO users_user_subjects (user_id, tag_id)
VALUES
    ('2', (SELECT id FROM tags_tag WHERE slug = 'computer-science')),
    ('2', (SELECT id FROM tags_tag WHERE slug = 'cybersecurity')),
    ('4', (SELECT id FROM tags_tag WHERE slug = 'calculus')),
    ('4', (SELECT id FROM tags_tag WHERE slug = 'algebra')),
    ('7', (SELECT id FROM tags_tag WHERE slug = 'data-science-ai')),
    ('11', (SELECT id FROM tags_tag WHERE slug = 'statistics-probability')),
    ('14', (SELECT id FROM tags_tag WHERE slug = 'cybersecurity')),
    ('17', (SELECT id FROM tags_tag WHERE slug = 'web-development')),
    ('17', (SELECT id FROM tags_tag WHERE slug = 'devops-infrastructure')),
    ('1', (SELECT id FROM tags_tag WHERE slug = 'computer-science')),
    ('3', (SELECT id FROM tags_tag WHERE slug = 'calculus')),
    ('3', (SELECT id FROM tags_tag WHERE slug = 'discrete-mathematics')),
    ('5', (SELECT id FROM tags_tag WHERE slug = 'web-development')),
    ('6', (SELECT id FROM tags_tag WHERE slug = 'mechanical-engineering')),
    ('8', (SELECT id FROM tags_tag WHERE slug = 'cloud-computing')),
    ('9', (SELECT id FROM tags_tag WHERE slug = 'physics')),
    ('10', (SELECT id FROM tags_tag WHERE slug = 'statistics-probability')),
    ('12', (SELECT id FROM tags_tag WHERE slug = 'cybersecurity')),
    ('13', (SELECT id FROM tags_tag WHERE slug = 'devops-infrastructure')),
    ('15', (SELECT id FROM tags_tag WHERE slug = 'civil-engineering')),
    ('16', (SELECT id FROM tags_tag WHERE slug = 'computer-science')),
    ('18', (SELECT id FROM tags_tag WHERE slug = 'discrete-mathematics'))
;

-- users_role_change_log: 20 rows
INSERT INTO users_role_change_log (user_id, previous_role, new_role, reason, created_at)
VALUES
    (16, 'student', 'expert_solver', 'auto_promoted', '2026-06-07T09:00:00'),
    (14, 'expert_solver', 'student', 'auto_demoted', '2026-03-27T09:00:00'),
    (7, 'expert_solver', 'student', 'manual', '2026-03-08T09:00:00'),
    (9, 'student', 'expert_solver', 'auto_promoted', '2026-01-21T09:00:00'),
    (8, 'expert_solver', 'student', 'auto_demoted', '2026-03-31T09:00:00'),
    (5, 'student', 'expert_solver', 'manual', '2026-03-30T09:00:00'),
    (1, 'student', 'expert_solver', 'auto_promoted', '2026-04-03T09:00:00'),
    (1, 'expert_solver', 'student', 'auto_demoted', '2026-05-10T09:00:00'),
    (17, 'expert_solver', 'student', 'manual', '2026-01-04T09:00:00'),
    (6, 'student', 'expert_solver', 'auto_promoted', '2026-01-09T09:00:00'),
    (15, 'expert_solver', 'student', 'auto_demoted', '2026-01-18T09:00:00'),
    (11, 'student', 'expert_solver', 'manual', '2026-01-28T09:00:00'),
    (5, 'student', 'expert_solver', 'auto_promoted', '2026-01-21T09:00:00'),
    (3, 'expert_solver', 'student', 'auto_demoted', '2026-05-20T09:00:00'),
    (17, 'student', 'expert_solver', 'manual', '2026-05-22T09:00:00'),
    (8, 'student', 'expert_solver', 'auto_promoted', '2026-03-06T09:00:00'),
    (12, 'expert_solver', 'student', 'auto_demoted', '2026-03-27T09:00:00'),
    (16, 'expert_solver', 'student', 'manual', '2026-01-20T09:00:00'),
    (15, 'student', 'expert_solver', 'auto_promoted', '2026-01-07T09:00:00'),
    (2, 'expert_solver', 'student', 'auto_demoted', '2026-02-10T09:00:00')
;

-- users_google_oauth_token: 7 rows
INSERT INTO users_google_oauth_token (user_id, access_token, refresh_token, created_at, updated_at)
VALUES
    (7, 'ya29.demo-access-token-5c090628392e4ba8', '1//demo-refresh-token-66d63bac462547de', '2026-05-03T09:00:00', '2026-05-05T03:00:00'),
    (8, 'ya29.demo-access-token-1d96e9e2b519490a', '1//demo-refresh-token-b6093063335c4c06', '2026-06-14T09:00:00', '2026-06-15T15:00:00'),
    (13, 'ya29.demo-access-token-ab5c56e4231c4568', '1//demo-refresh-token-b3e42321f9b54d5e', '2026-06-20T09:00:00', '2026-06-22T02:00:00'),
    (17, 'ya29.demo-access-token-47c154e2be6c4b43', '1//demo-refresh-token-872ccd36389e4430', '2026-03-18T09:00:00', '2026-03-19T20:00:00'),
    (1, 'ya29.demo-access-token-ee04a7880ae44668', '1//demo-refresh-token-bac702ca0fc34a66', '2026-06-12T09:00:00', '2026-06-13T13:00:00'),
    (2, 'ya29.demo-access-token-c847741236274c36', '1//demo-refresh-token-a887908de6b649af', '2026-02-03T09:00:00', '2026-02-05T02:00:00'),
    (9, 'ya29.demo-access-token-2753ca92eeec42a7', '1//demo-refresh-token-e3eb4c5855354217', '2026-05-05T09:00:00', '2026-05-08T01:00:00')
;

-- resources_resource: 24 rows
INSERT INTO resources_resource (id, submitted_by_id, title, url, resource_type, tag_id, net_votes, created_at)
VALUES
    ('a0b9ea7d-561f-4013-98b3-7559d81c0646', 2, 'CS50: Introduction to Computer Science', 'https://cs50.harvard.edu/x/', 'video', (SELECT id FROM tags_tag WHERE slug = 'data-structures'), 10, '2026-01-18T09:00:00'),
    ('f2123fde-13b5-41b4-9b8b-377c8bccfdf2', 2, 'Introduction to Algorithms (CLRS)', 'https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/', 'textbook', (SELECT id FROM tags_tag WHERE slug = 'algorithms'), 12, '2026-05-26T09:00:00'),
    ('e3754448-9efb-490e-b84c-cdf375c0093a', 16, 'Understanding Memory Management in C', 'https://www.geeksforgeeks.org/memory-management-in-c/', 'article', (SELECT id FROM tags_tag WHERE slug = 'memory-management'), 6, '2026-05-27T09:00:00'),
    ('87dbc22a-6be9-4960-bc24-fcb274fe9982', 1, 'Crafting Interpreters', 'https://craftinginterpreters.com/', 'website', (SELECT id FROM tags_tag WHERE slug = 'compilers'), 5, '2026-02-08T09:00:00'),
    ('976bc209-1f46-4a86-9d27-bcdd41b23dad', 16, 'JavaScript.info: Async/Await', 'https://javascript.info/async-await', 'article', (SELECT id FROM tags_tag WHERE slug = 'asynchronous-programming'), 15, '2026-04-25T09:00:00'),
    ('757ffc17-62f3-4ca5-888a-318c12392df5', 14, 'Applied Cryptography (Schneier)', 'https://www.schneier.com/books/applied-cryptography/', 'textbook', (SELECT id FROM tags_tag WHERE slug = 'cryptography'), 16, '2026-03-14T09:00:00'),
    ('9af340dd-1019-448c-824d-880c34b66845', 12, 'OWASP Top 10 Web Security Risks', 'https://owasp.org/www-project-top-ten/', 'website', (SELECT id FROM tags_tag WHERE slug = 'network-security'), 16, '2026-03-21T09:00:00'),
    ('9eebee0f-0522-49a4-adb4-3b67965936df', 14, 'TryHackMe: Pentesting Fundamentals', 'https://tryhackme.com/', 'website', (SELECT id FROM tags_tag WHERE slug = 'penetration-testing'), 9, '2026-05-06T09:00:00'),
    ('90cfe31c-a911-45e8-9ce2-1dfe2689285a', 12, 'Zero Trust Networks (O''Reilly)', 'https://www.oreilly.com/library/view/zero-trust-networks/9781491962183/', 'textbook', (SELECT id FROM tags_tag WHERE slug = 'zero-trust-architecture'), 2, '2026-02-21T09:00:00'),
    ('adba0f08-efd5-4ee6-9593-b06f455c0017', 7, 'Andrew Ng''s Machine Learning Specialization', 'https://www.coursera.org/specializations/machine-learning-introduction', 'video', (SELECT id FROM tags_tag WHERE slug = 'machine-learning'), 13, '2026-06-08T09:00:00'),
    ('460234ea-88af-4970-b5b1-a29096ee1d8f', 7, 'Deep Learning Book (Goodfellow et al.)', 'https://www.deeplearningbook.org/', 'textbook', (SELECT id FROM tags_tag WHERE slug = 'deep-learning'), -1, '2026-06-03T09:00:00'),
    ('96083b3a-5fdb-42fb-9a1c-86de6e1c901a', 7, '3Blue1Brown: Neural Networks Series', 'https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi', 'video', (SELECT id FROM tags_tag WHERE slug = 'neural-networks'), 2, '2026-01-22T09:00:00'),
    ('d7c71b7d-cf3a-4715-82de-d2583a7d534f', 13, 'Hugging Face NLP Course', 'https://huggingface.co/learn/nlp-course', 'website', (SELECT id FROM tags_tag WHERE slug = 'natural-language-processing'), 3, '2026-01-08T09:00:00'),
    ('0a1353f3-d0ac-488b-9029-92529eeaf38c', 7, 'PyTorch Computer Vision Tutorials', 'https://pytorch.org/tutorials/', 'website', (SELECT id FROM tags_tag WHERE slug = 'computer-vision'), 11, '2026-01-30T09:00:00'),
    ('3c0ee2e6-6cb5-43fe-92b9-0bb4ff14024d', 17, 'Designing Data-Intensive Applications', 'https://dataintensive.net/', 'textbook', (SELECT id FROM tags_tag WHERE slug = 'backend-development'), 0, '2026-03-25T09:00:00'),
    ('c555c85e-1fe9-4ecc-b03f-5f65ee59437f', 5, 'MDN: RESTful API Design', 'https://developer.mozilla.org/en-US/docs/Glossary/REST', 'article', (SELECT id FROM tags_tag WHERE slug = 'restful-apis'), 10, '2026-01-30T09:00:00'),
    ('1c2e2b6a-2323-49b8-9142-9eb46b7ee19a', 8, 'AWS Well-Architected Framework', 'https://aws.amazon.com/architecture/well-architected/', 'website', (SELECT id FROM tags_tag WHERE slug = 'aws'), 12, '2026-02-16T09:00:00'),
    ('460c2c07-739a-4bb8-8074-a394535fd405', 8, 'Serverless Framework Docs', 'https://www.serverless.com/framework/docs', 'website', (SELECT id FROM tags_tag WHERE slug = 'serverless-architecture'), 6, '2026-02-10T09:00:00'),
    ('6c38dc6d-a444-4e9a-9bed-f5f47bc2f6ec', 17, 'Terraform: Up & Running', 'https://www.terraformupandrunning.com/', 'textbook', (SELECT id FROM tags_tag WHERE slug = 'infrastructure-as-code'), -2, '2026-01-08T09:00:00'),
    ('5c6001b1-c3fa-45b9-9e2b-c354ddab9e9f', 13, 'Kubernetes: Up and Running', 'https://www.oreilly.com/library/view/kubernetes-up-and/9781098110192/', 'textbook', (SELECT id FROM tags_tag WHERE slug = 'kubernetes-orchestration'), 1, '2026-01-08T09:00:00'),
    ('39267ccc-b21c-493b-a5fe-0ebbd7663775', 4, 'Paul''s Online Math Notes: Chain Rule', 'https://tutorial.math.lamar.edu/classes/calci/chainrule.aspx', 'article', (SELECT id FROM tags_tag WHERE slug = 'chain-rule'), 15, '2026-04-24T09:00:00'),
    ('ca3cc615-c718-48d8-af99-8a1d1bf8ce8d', 4, '3Blue1Brown: Essence of Linear Algebra', 'https://www.3blue1brown.com/topics/linear-algebra', 'video', (SELECT id FROM tags_tag WHERE slug = 'linear-algebra'), 18, '2026-04-05T09:00:00'),
    ('9a035b97-0c8f-466c-91ad-901df745ee51', 11, 'Think Bayes (Allen Downey)', 'https://greenteapress.com/wp/think-bayes/', 'textbook', (SELECT id FROM tags_tag WHERE slug = 'bayesian-inference'), 1, '2026-04-17T09:00:00'),
    ('8fb7f31d-1bef-4b43-b5d1-df452e07369b', 18, 'Introduction to Graph Theory (West)', 'https://www.pearson.com/en-us/subject-catalog/p/introduction-to-graph-theory/', 'textbook', (SELECT id FROM tags_tag WHERE slug = 'graph-theory'), 11, '2026-05-22T09:00:00')
;

-- resources_vote: 26 rows
INSERT INTO resources_vote (id, resource_id, user_id, value)
VALUES
    ('f15ca611-2ddf-4a3d-96b0-a9b6d64e6055', '3c0ee2e6-6cb5-43fe-92b9-0bb4ff14024d', 1, 1),
    ('dc8a184c-5102-40ef-81b8-910280fa23c6', '1c2e2b6a-2323-49b8-9142-9eb46b7ee19a', 6, 1),
    ('5e37ee18-66ca-4e0d-94db-d07151de2475', '39267ccc-b21c-493b-a5fe-0ebbd7663775', 10, 1),
    ('e228d49c-ee3c-4325-b3f5-a7ee6ff6a5c3', '976bc209-1f46-4a86-9d27-bcdd41b23dad', 12, 1),
    ('4824b886-816f-4aff-9790-511a569a1344', '460c2c07-739a-4bb8-8074-a394535fd405', 17, 1),
    ('b77ed44c-14d9-4edf-b897-a98b289a7372', '5c6001b1-c3fa-45b9-9e2b-c354ddab9e9f', 11, -1),
    ('224f2b64-de21-4604-84a1-ceb38e76700c', 'a0b9ea7d-561f-4013-98b3-7559d81c0646', 4, 1),
    ('612ea22c-fbb4-4c78-bf12-4d43f3713e53', 'adba0f08-efd5-4ee6-9593-b06f455c0017', 8, 1),
    ('68245f85-f748-4499-8498-ae8f75c1e693', '9eebee0f-0522-49a4-adb4-3b67965936df', 3, 1),
    ('74809694-839c-4cec-a291-927756f26b01', '8fb7f31d-1bef-4b43-b5d1-df452e07369b', 16, 1),
    ('d692c6be-110b-4310-94ef-1df46f6a300c', '460c2c07-739a-4bb8-8074-a394535fd405', 5, 1),
    ('b97fcd2d-93de-4f19-80d4-b3177b68baad', 'ca3cc615-c718-48d8-af99-8a1d1bf8ce8d', 16, 1),
    ('53580bda-e671-4f2b-b1db-6d7145b7fa16', '90cfe31c-a911-45e8-9ce2-1dfe2689285a', 17, -1),
    ('1847afae-ef2f-4528-9761-537ce16f8b96', '9af340dd-1019-448c-824d-880c34b66845', 18, 1),
    ('4ae4e31a-cbb1-4b5d-9d7f-9ae761c75ed0', '9a035b97-0c8f-466c-91ad-901df745ee51', 10, -1),
    ('59754948-6e55-4145-8544-ac4d093bbf23', 'ca3cc615-c718-48d8-af99-8a1d1bf8ce8d', 12, -1),
    ('fb21246a-6157-47ee-be39-154d96fc023f', '1c2e2b6a-2323-49b8-9142-9eb46b7ee19a', 15, 1),
    ('f6379365-68b2-42c1-8b61-8f85337bfbc2', '9eebee0f-0522-49a4-adb4-3b67965936df', 8, 1),
    ('67a007ee-fab1-4e70-8aec-4fd69588cf00', '460234ea-88af-4970-b5b1-a29096ee1d8f', 1, 1),
    ('740d2940-6bae-46e0-9566-de4cf1114dc2', '6c38dc6d-a444-4e9a-9bed-f5f47bc2f6ec', 8, 1),
    ('bfa92dd2-1d88-4743-a1bd-dc7ef1afdd78', 'e3754448-9efb-490e-b84c-cdf375c0093a', 2, 1),
    ('d87b2cae-3be9-4b9c-9dc7-7d49bab4db83', '460234ea-88af-4970-b5b1-a29096ee1d8f', 3, 1),
    ('655d28f0-4b65-4eed-9423-8228f3cb5f84', '90cfe31c-a911-45e8-9ce2-1dfe2689285a', 16, 1),
    ('47814694-0c11-47bd-a2e4-588f62bbf1b6', '9eebee0f-0522-49a4-adb4-3b67965936df', 16, -1),
    ('1520e3e6-bb0e-4d56-8390-3f1745053caa', '9af340dd-1019-448c-824d-880c34b66845', 4, 1),
    ('352aa56b-4282-4599-9da3-81ebd904d05c', 'ca3cc615-c718-48d8-af99-8a1d1bf8ce8d', 14, 1)
;

-- forum_question: 25 rows
INSERT INTO forum_question (id, author_id, title, body, is_resolved, upvote_count, created_at, updated_at)
VALUES
    ('40e9c76e-ffff-4d1d-a7ff-8d41019d5d5f', 16, 'Why does my recursive Fibonacci function take forever for n > 35?', 'I wrote a plain recursive Fibonacci in Python and it grinds to a halt past n=35. Is this expected? How do people usually fix it?', TRUE, 13, '2026-03-19T09:00:00', '2026-06-19T09:00:00'),
    ('72943e93-781f-4165-a77d-b93f4fc11f9e', 1, 'How do I choose a good pivot for quicksort?', 'My quicksort degrades to O(n^2) on sorted input. What pivot strategies actually help in practice?', FALSE, 23, '2026-06-19T09:00:00', '2026-06-12T09:00:00'),
    ('dde446d9-364b-496e-80c4-fb9e1a13251e', 5, 'Confused about garbage collection in Python vs manual memory management in C', 'Coming from C, I don''t understand when Python actually frees memory. Reference counting vs GC?', FALSE, 20, '2026-06-07T09:00:00', '2026-07-02T09:00:00'),
    ('dad8c4e1-7879-4148-a31e-4df7ec69c894', 1, 'What''s actually the difference between a compiler and an interpreter?', 'I get that one ''translates'' and one ''runs'', but where does something like the JVM fit in?', TRUE, 12, '2026-04-07T09:00:00', '2026-06-08T09:00:00'),
    ('88edaf09-9525-416f-828f-03a75ed0af87', 5, 'async/await vs Promises in JS - when should I use which?', 'I keep mixing .then() chains with await and it gets messy. What''s the idiomatic approach in 2026?', FALSE, 3, '2026-04-30T09:00:00', '2026-06-27T09:00:00'),
    ('159f4579-927f-48de-9ae1-31445dfac97c', 12, 'How does RSA encryption actually work under the hood?', 'I understand public/private keys conceptually but not the math behind why it''s secure.', TRUE, 6, '2026-02-15T09:00:00', '2026-06-19T09:00:00'),
    ('28164d15-cab8-4ff1-a25e-90e735cb0b36', 13, 'Best practices for securing a public-facing REST API', 'Building my first production API. What should I absolutely not skip on the security side?', FALSE, 4, '2026-03-16T09:00:00', '2026-06-28T09:00:00'),
    ('9504f6ac-56d1-46f1-b353-9501fca545ce', 8, 'What is Zero Trust and why is everyone suddenly talking about it?', 'Heard this term at an internship interview and had no clue what it meant. ELI5?', FALSE, 8, '2026-03-06T09:00:00', '2026-06-26T09:00:00'),
    ('1be895af-e3a0-4696-aae5-3b320dec28f7', 8, 'Difference between supervised and unsupervised learning, with real examples', 'Textbook definitions make sense but I can''t map them to real projects.', TRUE, 2, '2026-03-11T09:00:00', '2026-06-08T09:00:00'),
    ('5aaf38ff-88b6-4986-b11e-3caa391aecb5', 13, 'How do transformers actually work in NLP? Attention is still confusing me', 'I get ''attention is all you need'' as a phrase but not the actual mechanism.', FALSE, 17, '2026-06-07T09:00:00', '2026-07-02T09:00:00'),
    ('57f5cfd7-cb4c-45f3-a4d5-0ec7ecc97425', 9, 'CNN vs RNN - which should I use for image classification?', 'Working on a small image classifier for a class project, not sure which architecture fits.', FALSE, 20, '2026-02-14T09:00:00', '2026-06-07T09:00:00'),
    ('7405a608-3d35-453b-8b2b-1fe21547cd8e', 16, 'Node.js vs Django for a backend - genuine tradeoffs?', 'Starting a new project and want actual reasoning, not just ''it depends''.', TRUE, 0, '2026-06-09T09:00:00', '2026-06-04T09:00:00'),
    ('2f7e99cc-b0c8-49b3-bdf9-4a0e572c2b27', 5, 'How do I design a WebSocket-based chat feature that scales?', 'Building something like a study-group chat. Worried about connection limits.', FALSE, 24, '2026-05-03T09:00:00', '2026-06-28T09:00:00'),
    ('0e9bf3c2-3ad0-4474-a276-504d968d4ab7', 8, 'AWS Lambda cold starts are killing my API latency - how do I reduce them?', 'P99 latency spikes badly on cold starts. Provisioned concurrency worth the cost?', FALSE, 13, '2026-02-28T09:00:00', '2026-06-18T09:00:00'),
    ('83671c3a-e190-4797-a0b9-1588f72cebac', 17, 'Terraform vs CloudFormation - which is actually worth learning first?', 'Team is AWS-only right now but might go multi-cloud eventually.', TRUE, 6, '2026-03-22T09:00:00', '2026-06-05T09:00:00'),
    ('04552757-cf0a-4ff7-a379-ebe46fe03340', 13, 'My Kubernetes pod keeps crash-looping and the logs are unhelpful', 'Getting CrashLoopBackOff with no clear error in kubectl logs. Where do I even look next?', FALSE, 1, '2026-05-21T09:00:00', '2026-06-21T09:00:00'),
    ('510f616c-6a6a-4ddf-b368-fd7f25ac6082', 3, 'How do I approach related rates problems in calculus?', 'I understand the chain rule in isolation but freeze on word problems.', TRUE, 0, '2026-03-25T09:00:00', '2026-06-25T09:00:00'),
    ('46d82552-6b8d-43c5-8279-507fa08dc94b', 3, 'Struggling to build intuition for eigenvalues and eigenvectors', 'I can compute them mechanically but don''t ''get'' what they represent geometrically.', FALSE, 14, '2026-04-20T09:00:00', '2026-06-20T09:00:00'),
    ('70b20b54-0333-469e-a6ec-e13cd0f9d567', 10, 'When should I use Bayesian methods instead of frequentist stats?', 'Our stats course only covers frequentist. Curious when Bayesian actually wins in practice.', FALSE, 22, '2026-02-10T09:00:00', '2026-06-12T09:00:00'),
    ('693dea47-0740-4cd7-b989-99fd907ab092', 10, 'Can someone explain the Central Limit Theorem without the formal proof?', 'I need the intuition before the math clicks for me.', TRUE, 22, '2026-02-28T09:00:00', '2026-06-29T09:00:00'),
    ('65d9a57a-70f8-418f-8705-5cae032958a4', 18, 'What''s a clean way to approach graph coloring proofs?', 'Stuck on a homework problem about chromatic number bounds.', FALSE, 6, '2026-04-18T09:00:00', '2026-06-27T09:00:00'),
    ('c7db82e3-dde0-4bc4-aad4-b64ade9df691', 18, 'How does Diffie-Hellman key exchange relate to modular arithmetic?', 'I can follow the modular arithmetic steps but not why it''s secure against eavesdroppers.', FALSE, 1, '2026-02-04T09:00:00', '2026-06-10T09:00:00'),
    ('b4fcc942-7d2d-46f8-b13f-2487c601f008', 3, 'Any intuitive explanation for manifolds before I read the formal topology definition?', 'The formal definition is not clicking. Looking for an intuition-first explanation.', FALSE, 17, '2026-06-17T09:00:00', '2026-06-10T09:00:00'),
    ('43ffa1bb-b3e3-4ffe-a270-0c07e8bcc563', 9, 'Why does entropy always increase? Is there an intuitive reason, not just the formula?', 'Studying thermodynamics and the 2nd law feels like magic right now.', TRUE, 10, '2026-06-18T09:00:00', '2026-07-02T09:00:00'),
    ('c3c03e2c-89a4-4dd2-969b-b86c4e373716', 9, 'Help applying Newton''s second law to a pulley system problem', 'Classic two-block-and-pulley setup, I keep getting the signs wrong.', FALSE, 18, '2026-03-02T09:00:00', '2026-06-17T09:00:00')
;

-- forum_question_tags: 32 rows
INSERT INTO forum_question_tags (question_id, tag_id)
VALUES
    ('40e9c76e-ffff-4d1d-a7ff-8d41019d5d5f', (SELECT id FROM tags_tag WHERE slug = 'algorithms')),
    ('72943e93-781f-4165-a77d-b93f4fc11f9e', (SELECT id FROM tags_tag WHERE slug = 'algorithms')),
    ('72943e93-781f-4165-a77d-b93f4fc11f9e', (SELECT id FROM tags_tag WHERE slug = 'data-structures')),
    ('dde446d9-364b-496e-80c4-fb9e1a13251e', (SELECT id FROM tags_tag WHERE slug = 'memory-management')),
    ('dad8c4e1-7879-4148-a31e-4df7ec69c894', (SELECT id FROM tags_tag WHERE slug = 'compilers')),
    ('88edaf09-9525-416f-828f-03a75ed0af87', (SELECT id FROM tags_tag WHERE slug = 'asynchronous-programming')),
    ('159f4579-927f-48de-9ae1-31445dfac97c', (SELECT id FROM tags_tag WHERE slug = 'cryptography')),
    ('28164d15-cab8-4ff1-a25e-90e735cb0b36', (SELECT id FROM tags_tag WHERE slug = 'network-security')),
    ('28164d15-cab8-4ff1-a25e-90e735cb0b36', (SELECT id FROM tags_tag WHERE slug = 'restful-apis')),
    ('9504f6ac-56d1-46f1-b353-9501fca545ce', (SELECT id FROM tags_tag WHERE slug = 'zero-trust-architecture')),
    ('1be895af-e3a0-4696-aae5-3b320dec28f7', (SELECT id FROM tags_tag WHERE slug = 'machine-learning')),
    ('5aaf38ff-88b6-4986-b11e-3caa391aecb5', (SELECT id FROM tags_tag WHERE slug = 'natural-language-processing')),
    ('5aaf38ff-88b6-4986-b11e-3caa391aecb5', (SELECT id FROM tags_tag WHERE slug = 'neural-networks')),
    ('57f5cfd7-cb4c-45f3-a4d5-0ec7ecc97425', (SELECT id FROM tags_tag WHERE slug = 'computer-vision')),
    ('57f5cfd7-cb4c-45f3-a4d5-0ec7ecc97425', (SELECT id FROM tags_tag WHERE slug = 'neural-networks')),
    ('7405a608-3d35-453b-8b2b-1fe21547cd8e', (SELECT id FROM tags_tag WHERE slug = 'backend-development')),
    ('2f7e99cc-b0c8-49b3-bdf9-4a0e572c2b27', (SELECT id FROM tags_tag WHERE slug = 'websockets')),
    ('2f7e99cc-b0c8-49b3-bdf9-4a0e572c2b27', (SELECT id FROM tags_tag WHERE slug = 'backend-development')),
    ('0e9bf3c2-3ad0-4474-a276-504d968d4ab7', (SELECT id FROM tags_tag WHERE slug = 'serverless-architecture')),
    ('0e9bf3c2-3ad0-4474-a276-504d968d4ab7', (SELECT id FROM tags_tag WHERE slug = 'aws')),
    ('83671c3a-e190-4797-a0b9-1588f72cebac', (SELECT id FROM tags_tag WHERE slug = 'infrastructure-as-code')),
    ('04552757-cf0a-4ff7-a379-ebe46fe03340', (SELECT id FROM tags_tag WHERE slug = 'kubernetes-orchestration')),
    ('510f616c-6a6a-4ddf-b368-fd7f25ac6082', (SELECT id FROM tags_tag WHERE slug = 'chain-rule')),
    ('46d82552-6b8d-43c5-8279-507fa08dc94b', (SELECT id FROM tags_tag WHERE slug = 'eigenvalues-eigenvectors')),
    ('70b20b54-0333-469e-a6ec-e13cd0f9d567', (SELECT id FROM tags_tag WHERE slug = 'bayesian-inference')),
    ('693dea47-0740-4cd7-b989-99fd907ab092', (SELECT id FROM tags_tag WHERE slug = 'central-limit-theorem')),
    ('65d9a57a-70f8-418f-8705-5cae032958a4', (SELECT id FROM tags_tag WHERE slug = 'graph-theory')),
    ('c7db82e3-dde0-4bc4-aad4-b64ade9df691', (SELECT id FROM tags_tag WHERE slug = 'modular-arithmetic')),
    ('c7db82e3-dde0-4bc4-aad4-b64ade9df691', (SELECT id FROM tags_tag WHERE slug = 'cryptography')),
    ('b4fcc942-7d2d-46f8-b13f-2487c601f008', (SELECT id FROM tags_tag WHERE slug = 'manifolds')),
    ('43ffa1bb-b3e3-4ffe-a270-0c07e8bcc563', (SELECT id FROM tags_tag WHERE slug = 'thermodynamics')),
    ('c3c03e2c-89a4-4dd2-969b-b86c4e373716', (SELECT id FROM tags_tag WHERE slug = 'newtonian-mechanics'))
;

-- forum_answer: 27 rows
INSERT INTO forum_answer (id, question_id, author_id, body, is_endorsed, is_accepted, upvote_count, downvote_count, created_at)
VALUES
    ('0332bfe6-1767-4750-997a-481feb216c1f', '40e9c76e-ffff-4d1d-a7ff-8d41019d5d5f', 2, 'Naive recursion recomputes the same subproblems exponentially. Memoize with a dict or switch to an iterative bottom-up DP and it''ll be instant even for n=1000.', TRUE, TRUE, 17, 1, '2026-03-19T18:00:00'),
    ('c0de8fe3-6dc3-4acc-a62d-92f89682c0b6', '40e9c76e-ffff-4d1d-a7ff-8d41019d5d5f', 2, 'Median-of-three pivot selection (or randomized pivot) avoids the worst case on already-sorted input almost entirely.', TRUE, FALSE, 17, 0, '2026-03-20T10:00:00'),
    ('e908a06b-b147-4c88-9885-72a39b228893', '72943e93-781f-4165-a77d-b93f4fc11f9e', 2, 'Naive recursion recomputes the same subproblems exponentially. Memoize with a dict or switch to an iterative bottom-up DP and it''ll be instant even for n=1000.', TRUE, FALSE, 3, 0, '2026-06-23T01:00:00'),
    ('3cb33977-8fb7-402b-8f7d-c489bfd4be2a', '72943e93-781f-4165-a77d-b93f4fc11f9e', 2, 'Median-of-three pivot selection (or randomized pivot) avoids the worst case on already-sorted input almost entirely.', TRUE, FALSE, 8, 3, '2026-06-20T02:00:00'),
    ('736a91d1-6bea-4d3a-bf9a-917bc21296a9', 'dde446d9-364b-496e-80c4-fb9e1a13251e', 16, 'Python uses reference counting for immediate cleanup plus a cyclic GC for reference cycles. C requires you to free() manually, which is why use-after-free bugs exist there but not (usually) in Python.', FALSE, FALSE, 19, 1, '2026-06-10T13:00:00'),
    ('64712568-1d4f-479e-808f-f6f0ceadc6ed', 'dad8c4e1-7879-4148-a31e-4df7ec69c894', 2, 'A compiler translates source to another form ahead of time (often machine code); an interpreter executes source directly, statement by statement. The JVM is a hybrid: it compiles to bytecode, then JIT-compiles hot paths to machine code at runtime.', TRUE, TRUE, 20, 0, '2026-04-10T18:00:00'),
    ('05daf4f8-f992-43f8-a526-3e2308b6023e', '88edaf09-9525-416f-828f-03a75ed0af87', 17, 'Use async/await for anything sequential-looking — it reads top to bottom. Reach for raw Promises (Promise.all, etc.) when you need to run independent async operations concurrently.', TRUE, FALSE, 3, 3, '2026-05-03T23:00:00'),
    ('ba3572f1-decf-4a5b-90f9-6b1ecd3e84d7', '159f4579-927f-48de-9ae1-31445dfac97c', 14, 'RSA''s security relies on the fact that factoring the product of two large primes is computationally hard, while multiplying them is easy. Your public key is that product; your private key relies on knowing the original primes.', TRUE, TRUE, 19, 2, '2026-02-16T20:00:00'),
    ('4b3f9ba0-f445-45d3-b195-cc1e84ac1ceb', '159f4579-927f-48de-9ae1-31445dfac97c', 14, 'Diffie-Hellman works because computing g^(ab) mod p from g^a mod p and g^b mod p (without knowing a or b) is the discrete log problem — believed to be hard for large enough p.', TRUE, FALSE, 7, 2, '2026-02-16T17:00:00'),
    ('4d26b408-d38e-4b86-a337-9d118da8f817', '28164d15-cab8-4ff1-a25e-90e735cb0b36', 12, 'At minimum: rate limiting, input validation, HTTPS everywhere, proper auth (OAuth2/JWT with short expiry), and logging/monitoring for anomalies. OWASP Top 10 is a great checklist to work through.', TRUE, FALSE, 9, 3, '2026-03-17T03:00:00'),
    ('35841489-1865-4d1e-8baa-e9226c35d1ac', '9504f6ac-56d1-46f1-b353-9501fca545ce', 12, 'Zero Trust means ''never trust, always verify'' — no device or user is trusted by default even inside the corporate network. Every request gets authenticated and authorized regardless of where it originates.', TRUE, FALSE, 22, 2, '2026-03-08T21:00:00'),
    ('a1a2edd9-9587-4d3c-b7bc-38da2e196b7a', '1be895af-e3a0-4696-aae5-3b320dec28f7', 7, 'Supervised learning uses labeled data (e.g. predicting house prices from labeled sale data). Unsupervised finds structure without labels (e.g. clustering customers by behavior with no predefined groups).', TRUE, TRUE, 11, 0, '2026-03-11T12:00:00'),
    ('71ca6220-994a-481e-b6e8-98d5b5e60a6a', '5aaf38ff-88b6-4986-b11e-3caa391aecb5', 7, 'Attention lets the model weigh how relevant every other token is to the one it''s currently processing, instead of relying on a fixed-size hidden state like RNNs. That''s what lets transformers capture long-range dependencies well.', TRUE, FALSE, 15, 0, '2026-06-07T20:00:00'),
    ('8c6cc040-32ec-44cb-a629-9105f36a2d3a', '57f5cfd7-cb4c-45f3-a4d5-0ec7ecc97425', 7, 'For straightforward image classification, start with a CNN (or a pretrained one via transfer learning) — they exploit spatial locality. RNNs are built for sequential data and aren''t a natural fit unless you''re doing video/sequence tasks.', TRUE, FALSE, 18, 1, '2026-02-17T03:00:00'),
    ('958dd195-f63a-4f2a-982f-ac93fdad1cbd', '7405a608-3d35-453b-8b2b-1fe21547cd8e', 17, 'Node.js shines for I/O-heavy, real-time workloads (chat, streaming) due to its event loop. Django gives you a batteries-included ORM, admin panel, and auth out of the box, which is great for content-heavy or CRUD-heavy apps. Pick based on what your app actually does most.', TRUE, TRUE, 9, 1, '2026-06-11T07:00:00'),
    ('3398d81a-d09b-43c7-9d54-15d7502995fe', '7405a608-3d35-453b-8b2b-1fe21547cd8e', 17, 'For your WebSocket chat: use a pub/sub layer (Redis, or a managed service) behind your WebSocket servers so any server instance can broadcast to any connected client — that''s how you scale past a single process.', TRUE, FALSE, 3, 1, '2026-06-11T10:00:00'),
    ('dd546c6f-19fb-49e8-9daf-38c0ffc90133', '0e9bf3c2-3ad0-4474-a276-504d968d4ab7', 17, 'Provisioned concurrency helps a lot but costs more — reserve it only for your latency-critical endpoints. Also keep your deployment package small and avoid heavy imports at module load time.', TRUE, FALSE, 10, 1, '2026-03-02T19:00:00'),
    ('80914f95-47c8-49d2-84e0-0f935051bc64', '83671c3a-e190-4797-a0b9-1588f72cebac', 17, 'If you''re AWS-only today, CloudFormation is ''free'' and tightly integrated, but Terraform''s multi-cloud support and cleaner syntax make it the safer long-term bet if there''s any chance you''ll need another provider.', TRUE, FALSE, 18, 2, '2026-03-25T17:00:00'),
    ('583e11f9-2b57-4ba7-b37e-9247c77168d2', '04552757-cf0a-4ff7-a379-ebe46fe03340', 13, 'Check `kubectl describe pod <name>` (not just logs) for the actual failure reason — usually a failed readiness probe, OOMKill, or a missing config/secret. `kubectl logs --previous` also shows the crashed container''s last output.', TRUE, FALSE, 21, 0, '2026-05-25T00:00:00'),
    ('4c32ced1-cb91-46f7-bf99-2803dca93976', '510f616c-6a6a-4ddf-b368-fd7f25ac6082', 4, 'Related rates problems are chain rule in disguise: identify which quantities are changing with time, write an equation relating them, then differentiate both sides with respect to t before plugging in numbers.', TRUE, TRUE, 18, 2, '2026-03-28T23:00:00'),
    ('dde1f435-d098-4355-ad03-4db987ab1317', '46d82552-6b8d-43c5-8279-507fa08dc94b', 4, 'Geometrically, an eigenvector is a direction that a linear transformation doesn''t rotate — it only stretches or shrinks it, by the eigenvalue''s factor. Everything else in the space gets rotated in addition to scaled.', TRUE, FALSE, 4, 1, '2026-04-21T20:00:00'),
    ('11eb2929-680c-4832-a86b-7f06926745f0', '70b20b54-0333-469e-a6ec-e13cd0f9d567', 11, 'Bayesian methods shine when you have meaningful prior knowledge to incorporate, need to quantify uncertainty directly as a probability, or are updating beliefs sequentially as new data arrives (e.g. A/B tests running over time).', TRUE, FALSE, 4, 0, '2026-02-13T09:00:00'),
    ('2540c95d-7b79-47a7-ac8b-d50fa2fa2ecd', '693dea47-0740-4cd7-b989-99fd907ab092', 11, 'Intuition: no matter how weird your original data''s distribution is, if you take enough samples and average them repeatedly, those averages start to look like a bell curve. That''s why we can use normal-distribution-based stats on almost anything given a large enough sample.', TRUE, TRUE, 5, 2, '2026-03-01T23:00:00'),
    ('a04b0f98-20ee-4cf8-9bea-a3f562eab078', '65d9a57a-70f8-418f-8705-5cae032958a4', 18, 'Start with the trivial bound: chromatic number <= max degree + 1 (greedy coloring). Then look for structure in your specific graph (bipartite? planar?) since those give much tighter bounds than the general case.', TRUE, FALSE, 20, 1, '2026-04-22T06:00:00'),
    ('cbc7018f-86c9-43dd-a814-11a4b071cc0c', 'b4fcc942-7d2d-46f8-b13f-2487c601f008', 18, 'Before the formal definition, think of a manifold as any shape that looks ''flat'' if you zoom in close enough — a sphere''s surface looks like a flat plane locally even though it''s curved globally. That local-flatness idea is basically the whole definition.', TRUE, FALSE, 11, 1, '2026-06-21T02:00:00'),
    ('fa013da8-37ff-4d58-ae0b-1393075b119d', '43ffa1bb-b3e3-4ffe-a270-0c07e8bcc563', 9, 'Intuitively: there are vastly more disordered configurations than ordered ones, so as a system evolves randomly it overwhelmingly tends toward the more probable (disordered) states — that statistical tendency is entropy increasing.', FALSE, FALSE, 21, 2, '2026-06-21T03:00:00'),
    ('cdf547aa-35fa-4c35-83c6-16f6461c3791', 'c3c03e2c-89a4-4dd2-969b-b86c4e373716', 2, 'Draw a free-body diagram for each block separately, define one consistent positive direction for the whole system (e.g. ''direction block A accelerates''), then write F=ma per block. The sign errors almost always come from inconsistent direction conventions between the two blocks.', FALSE, FALSE, 16, 2, '2026-03-02T17:00:00')
;

-- forum_question_upvote: 26 rows
INSERT INTO forum_question_upvote (id, question_id, user_id, created_at)
VALUES
    ('2f36e6d1-4512-4b4b-8f94-352fabc7c13a', 'dde446d9-364b-496e-80c4-fb9e1a13251e', 14, '2026-05-16T09:00:00'),
    ('f97d517f-4211-4cdf-8880-81c601f83440', '1be895af-e3a0-4696-aae5-3b320dec28f7', 2, '2026-06-29T09:00:00'),
    ('6f45b068-0387-4b50-b99b-8f803d53b3c1', '40e9c76e-ffff-4d1d-a7ff-8d41019d5d5f', 11, '2026-05-04T09:00:00'),
    ('2dab57c4-f32c-4b4e-bbf7-5001af768148', 'c3c03e2c-89a4-4dd2-969b-b86c4e373716', 5, '2026-06-05T09:00:00'),
    ('4560c296-ac42-4e08-8951-42e1f0ce1cdc', '65d9a57a-70f8-418f-8705-5cae032958a4', 9, '2026-06-08T09:00:00'),
    ('a7369e5a-3d67-485e-bb4d-01dc03503b9f', '159f4579-927f-48de-9ae1-31445dfac97c', 15, '2026-05-06T09:00:00'),
    ('04f7eee0-2725-41ac-80f2-e0b69b7b437c', '46d82552-6b8d-43c5-8279-507fa08dc94b', 14, '2026-05-20T09:00:00'),
    ('581f2afa-31ec-4568-b480-38ea1f9ad28a', '46d82552-6b8d-43c5-8279-507fa08dc94b', 1, '2026-05-25T09:00:00'),
    ('9283e7a1-a5df-4a2b-9a7d-01815b098c91', 'dad8c4e1-7879-4148-a31e-4df7ec69c894', 3, '2026-06-04T09:00:00'),
    ('ef41b547-7d5b-4050-8358-ed47bba018c9', 'b4fcc942-7d2d-46f8-b13f-2487c601f008', 5, '2026-06-05T09:00:00'),
    ('57c6a6a2-5ff2-440a-b5e7-bd18d66fc895', '46d82552-6b8d-43c5-8279-507fa08dc94b', 2, '2026-06-30T09:00:00'),
    ('e46b5bd3-b777-4a5f-bacb-568482832672', '7405a608-3d35-453b-8b2b-1fe21547cd8e', 18, '2026-04-10T09:00:00'),
    ('1bd658c3-e952-4f8d-baaf-e468abc8a402', '88edaf09-9525-416f-828f-03a75ed0af87', 14, '2026-06-09T09:00:00'),
    ('6d5001e5-b216-4bd9-be82-562357bd455b', '88edaf09-9525-416f-828f-03a75ed0af87', 2, '2026-05-13T09:00:00'),
    ('d28c3f81-ce0a-4f22-b3e4-01ec27473dbe', '5aaf38ff-88b6-4986-b11e-3caa391aecb5', 12, '2026-05-22T09:00:00'),
    ('3b13438f-fa55-4478-9324-dc724515c7a5', '72943e93-781f-4165-a77d-b93f4fc11f9e', 12, '2026-05-29T09:00:00'),
    ('2a035de1-8724-4431-aae5-7077c3e95c47', '28164d15-cab8-4ff1-a25e-90e735cb0b36', 8, '2026-06-25T09:00:00'),
    ('da798e1c-360f-4dbd-9664-beaeda42ad29', 'c7db82e3-dde0-4bc4-aad4-b64ade9df691', 4, '2026-05-29T09:00:00'),
    ('99d04246-5dbd-4209-a82b-00f9051d25be', '0e9bf3c2-3ad0-4474-a276-504d968d4ab7', 5, '2026-05-20T09:00:00'),
    ('75631a02-4eba-491b-9e5a-6ed9fa216f52', '9504f6ac-56d1-46f1-b353-9501fca545ce', 6, '2026-04-12T09:00:00'),
    ('453f867e-ad09-4e8d-ad3c-b4031a167436', '159f4579-927f-48de-9ae1-31445dfac97c', 14, '2026-04-29T09:00:00'),
    ('05c6b1f1-5d89-4aec-a29f-756b9b20037b', '40e9c76e-ffff-4d1d-a7ff-8d41019d5d5f', 6, '2026-05-13T09:00:00'),
    ('c1487215-6885-4d9e-b7ad-8f1ba27e9894', '43ffa1bb-b3e3-4ffe-a270-0c07e8bcc563', 11, '2026-04-08T09:00:00'),
    ('d4f36fee-1e75-40de-ad5f-594a13bc1b92', '0e9bf3c2-3ad0-4474-a276-504d968d4ab7', 8, '2026-04-26T09:00:00'),
    ('23a4bf8f-e89e-4d09-824b-1f113482d064', '1be895af-e3a0-4696-aae5-3b320dec28f7', 6, '2026-05-22T09:00:00'),
    ('a2f8d45b-eea7-42c7-bebd-dba2ad09f944', 'b4fcc942-7d2d-46f8-b13f-2487c601f008', 4, '2026-06-30T09:00:00')
;

-- forum_answer_upvote: 26 rows
INSERT INTO forum_answer_upvote (id, answer_id, user_id, created_at)
VALUES
    ('db0709ce-862c-42c8-baf4-7d6a7fdfd7ca', '3cb33977-8fb7-402b-8f7d-c489bfd4be2a', 9, '2026-04-16T09:00:00'),
    ('8e8a70d1-445d-4951-b349-b1ca18226479', '64712568-1d4f-479e-808f-f6f0ceadc6ed', 9, '2026-04-22T09:00:00'),
    ('f2b56047-76cb-42f4-a5e4-de09271cad0e', 'c0de8fe3-6dc3-4acc-a62d-92f89682c0b6', 4, '2026-05-26T09:00:00'),
    ('f256f3f6-acec-4b47-b9cf-03d5c552c269', '4c32ced1-cb91-46f7-bf99-2803dca93976', 14, '2026-05-13T09:00:00'),
    ('488f788f-8f56-430f-ad76-37e45c8419c4', 'a1a2edd9-9587-4d3c-b7bc-38da2e196b7a', 11, '2026-04-24T09:00:00'),
    ('40141617-ff3e-4ec9-939f-876b7598343e', '8c6cc040-32ec-44cb-a629-9105f36a2d3a', 17, '2026-07-03T09:00:00'),
    ('333590dd-75b5-41cd-a310-e2a04b4ef3b0', '3cb33977-8fb7-402b-8f7d-c489bfd4be2a', 13, '2026-05-26T09:00:00'),
    ('613b9aaa-b630-4a67-9748-af8e04102c59', '583e11f9-2b57-4ba7-b37e-9247c77168d2', 7, '2026-05-28T09:00:00'),
    ('85a2b48a-88e6-46f2-9e9e-ecc6ffae33ea', '4b3f9ba0-f445-45d3-b195-cc1e84ac1ceb', 2, '2026-06-07T09:00:00'),
    ('b8f3c28d-180f-4915-acb6-fa29e9e636b6', '2540c95d-7b79-47a7-ac8b-d50fa2fa2ecd', 14, '2026-05-09T09:00:00'),
    ('64b50857-5b2e-4ab2-b57f-1e4584884189', '0332bfe6-1767-4750-997a-481feb216c1f', 17, '2026-04-20T09:00:00'),
    ('97c26e24-0a41-4569-8c79-11df3b9f4660', 'fa013da8-37ff-4d58-ae0b-1393075b119d', 18, '2026-04-17T09:00:00'),
    ('f11847f2-2ac1-425d-bde8-ba99c406591d', '11eb2929-680c-4832-a86b-7f06926745f0', 7, '2026-04-11T09:00:00'),
    ('59af49f2-8010-4f67-9662-86fea098ef3f', 'a1a2edd9-9587-4d3c-b7bc-38da2e196b7a', 14, '2026-05-23T09:00:00'),
    ('dcfd44df-ccbb-4308-beed-5df8fee2e7cc', 'e908a06b-b147-4c88-9885-72a39b228893', 11, '2026-05-05T09:00:00'),
    ('6f6445e1-db2a-42b0-9b6b-cc2123365faf', '4c32ced1-cb91-46f7-bf99-2803dca93976', 11, '2026-05-08T09:00:00'),
    ('5d68aed8-db4a-4f07-94b0-39093e466b9b', '11eb2929-680c-4832-a86b-7f06926745f0', 4, '2026-05-08T09:00:00'),
    ('3f12e2ed-3e7e-433c-8551-412157feba46', 'a04b0f98-20ee-4cf8-9bea-a3f562eab078', 10, '2026-04-08T09:00:00'),
    ('356ebca6-9944-45ba-9ffb-40a2ee5d6baf', 'dd546c6f-19fb-49e8-9daf-38c0ffc90133', 10, '2026-06-06T09:00:00'),
    ('e87f1854-d85e-40c2-9683-5745d84a378a', '11eb2929-680c-4832-a86b-7f06926745f0', 14, '2026-04-29T09:00:00'),
    ('c0336640-09d9-4972-a8d1-0cc3a716457b', '35841489-1865-4d1e-8baa-e9226c35d1ac', 13, '2026-05-04T09:00:00'),
    ('f6d760d8-d9c4-40ae-9daf-35b321f65a06', '2540c95d-7b79-47a7-ac8b-d50fa2fa2ecd', 10, '2026-06-12T09:00:00'),
    ('cadfdf50-554c-4b5b-90c6-aa4bd5a2843a', '80914f95-47c8-49d2-84e0-0f935051bc64', 5, '2026-04-10T09:00:00'),
    ('570c93b0-62d0-4b3f-b1ce-5434073b05fe', '05daf4f8-f992-43f8-a526-3e2308b6023e', 14, '2026-06-23T09:00:00'),
    ('268cd45d-8c84-46da-a27a-62ebc1f8b516', '11eb2929-680c-4832-a86b-7f06926745f0', 13, '2026-05-28T09:00:00'),
    ('68662aff-ee6c-4969-b13c-d353615c16f0', '11eb2929-680c-4832-a86b-7f06926745f0', 6, '2026-04-29T09:00:00')
;

-- forum_answer_downvote: 21 rows
INSERT INTO forum_answer_downvote (id, answer_id, user_id, created_at)
VALUES
    ('e31202f6-98c1-499c-902d-ef12de5f45af', '11eb2929-680c-4832-a86b-7f06926745f0', 11, '2026-04-09T09:00:00'),
    ('4a1c981b-2a24-4e40-9d63-b04ab64201d5', 'e908a06b-b147-4c88-9885-72a39b228893', 8, '2026-04-27T09:00:00'),
    ('2e0aefbb-b8b9-4d55-bd00-19d3ca2e8f3d', '11eb2929-680c-4832-a86b-7f06926745f0', 10, '2026-04-23T09:00:00'),
    ('99faf01a-3bbc-46db-a1d9-ea6e49d3bdac', 'ba3572f1-decf-4a5b-90f9-6b1ecd3e84d7', 7, '2026-04-18T09:00:00'),
    ('28033712-c151-4e64-aa72-7c6ddcad5df2', '736a91d1-6bea-4d3a-bf9a-917bc21296a9', 1, '2026-05-24T09:00:00'),
    ('e5bb444e-5534-4331-a8fa-416616fc8e91', 'c0de8fe3-6dc3-4acc-a62d-92f89682c0b6', 8, '2026-05-08T09:00:00'),
    ('c27b9dd1-cad6-4fad-a5b8-9408c65620f5', '3398d81a-d09b-43c7-9d54-15d7502995fe', 3, '2026-04-16T09:00:00'),
    ('28f50c20-98ca-437a-a18e-3bfa89f9961c', '958dd195-f63a-4f2a-982f-ac93fdad1cbd', 14, '2026-04-30T09:00:00'),
    ('c619f893-d0e2-4468-bed2-b6a2386d14ea', 'dde1f435-d098-4355-ad03-4db987ab1317', 7, '2026-05-10T09:00:00'),
    ('a8ba9113-a539-41d7-b9cb-82fb989ec127', '2540c95d-7b79-47a7-ac8b-d50fa2fa2ecd', 13, '2026-04-24T09:00:00'),
    ('f01f3421-e298-42ab-974c-6797e82bf4f5', '3398d81a-d09b-43c7-9d54-15d7502995fe', 13, '2026-05-07T09:00:00'),
    ('bfe0bbb8-34ea-43a8-8f31-c9cc14c5c224', 'ba3572f1-decf-4a5b-90f9-6b1ecd3e84d7', 5, '2026-06-13T09:00:00'),
    ('99f5acf8-b046-4977-a462-b58bc596ac50', 'dde1f435-d098-4355-ad03-4db987ab1317', 1, '2026-05-04T09:00:00'),
    ('5e6e3c1e-c556-426b-b145-a2d1d72d4926', 'cbc7018f-86c9-43dd-a814-11a4b071cc0c', 4, '2026-05-07T09:00:00'),
    ('94a519a5-5dfb-4960-9d54-0d05d83d0379', 'cbc7018f-86c9-43dd-a814-11a4b071cc0c', 14, '2026-05-31T09:00:00'),
    ('d1113e1d-1179-4162-b179-ba3f885941db', 'ba3572f1-decf-4a5b-90f9-6b1ecd3e84d7', 6, '2026-06-02T09:00:00'),
    ('2721b1a7-bd5c-48bb-b4be-a48575dc2632', 'fa013da8-37ff-4d58-ae0b-1393075b119d', 17, '2026-04-13T09:00:00'),
    ('5c6a894d-442b-46b6-afcc-ba73bcd00c73', '958dd195-f63a-4f2a-982f-ac93fdad1cbd', 2, '2026-05-29T09:00:00'),
    ('ac3ce4c9-5772-4fc8-976a-f276c0b5f75e', '80914f95-47c8-49d2-84e0-0f935051bc64', 8, '2026-04-28T09:00:00'),
    ('2ea4d1eb-e418-414f-8edf-97fa81ad42e4', '3cb33977-8fb7-402b-8f7d-c489bfd4be2a', 15, '2026-05-02T09:00:00'),
    ('02c464ff-fd67-4fd0-9dae-1e58d3c0e0cc', '736a91d1-6bea-4d3a-bf9a-917bc21296a9', 15, '2026-04-14T09:00:00')
;

-- forum_answer_resource: 21 rows
INSERT INTO forum_answer_resource (id, answer_id, resource_id, suggested_by_id, created_at)
VALUES
    ('b7a1c174-7b27-40d6-92d4-b632ad640d20', 'ba3572f1-decf-4a5b-90f9-6b1ecd3e84d7', '90cfe31c-a911-45e8-9ce2-1dfe2689285a', 14, '2026-02-18T01:00:00'),
    ('3564facc-6122-4ad6-98c5-6ab6f5907b18', 'e908a06b-b147-4c88-9885-72a39b228893', '9a035b97-0c8f-466c-91ad-901df745ee51', 2, '2026-06-23T20:00:00'),
    ('12da5e81-c771-4b12-92ea-637a7ea92826', '35841489-1865-4d1e-8baa-e9226c35d1ac', '460234ea-88af-4970-b5b1-a29096ee1d8f', 12, '2026-03-10T08:00:00'),
    ('df0815da-5e90-4393-8c03-4ee58d140670', 'e908a06b-b147-4c88-9885-72a39b228893', '976bc209-1f46-4a86-9d27-bcdd41b23dad', 2, '2026-06-23T11:00:00'),
    ('4486bc01-b0e6-4263-a735-6700fcd7801f', 'ba3572f1-decf-4a5b-90f9-6b1ecd3e84d7', 'd7c71b7d-cf3a-4715-82de-d2583a7d534f', 14, '2026-02-18T17:00:00'),
    ('e14a90ee-b556-46ac-a079-6de04854f90a', '736a91d1-6bea-4d3a-bf9a-917bc21296a9', '9a035b97-0c8f-466c-91ad-901df745ee51', 16, '2026-06-11T03:00:00'),
    ('73333d4d-3c4e-41b9-ab7f-62ab8b1c4bc5', 'e908a06b-b147-4c88-9885-72a39b228893', '0a1353f3-d0ac-488b-9029-92529eeaf38c', 2, '2026-06-24T04:00:00'),
    ('5817b331-5a22-4fcf-be0b-d23bc7cb8a0e', '35841489-1865-4d1e-8baa-e9226c35d1ac', '460c2c07-739a-4bb8-8074-a394535fd405', 12, '2026-03-10T03:00:00'),
    ('94ee7dbf-8f11-4431-a105-63d3e155de72', '8c6cc040-32ec-44cb-a629-9105f36a2d3a', 'f2123fde-13b5-41b4-9b8b-377c8bccfdf2', 7, '2026-02-17T17:00:00'),
    ('9a9a2c9a-2d9d-454d-98c9-f620d8cac21b', 'cdf547aa-35fa-4c35-83c6-16f6461c3791', '0a1353f3-d0ac-488b-9029-92529eeaf38c', 2, '2026-03-03T18:00:00'),
    ('60d74da8-c296-4059-8101-4089665cb257', 'cbc7018f-86c9-43dd-a814-11a4b071cc0c', '6c38dc6d-a444-4e9a-9bed-f5f47bc2f6ec', 18, '2026-06-22T23:00:00'),
    ('3f354615-bfc9-4f89-a9e6-f18ac91e3458', '0332bfe6-1767-4750-997a-481feb216c1f', '6c38dc6d-a444-4e9a-9bed-f5f47bc2f6ec', 2, '2026-03-20T19:00:00'),
    ('6440abec-9e87-4931-b2d3-bfaa05e389e8', '3398d81a-d09b-43c7-9d54-15d7502995fe', 'a0b9ea7d-561f-4013-98b3-7559d81c0646', 17, '2026-06-12T09:00:00'),
    ('80583a30-4d9f-4069-aebf-d28a33a3017b', '4d26b408-d38e-4b86-a337-9d118da8f817', 'd7c71b7d-cf3a-4715-82de-d2583a7d534f', 12, '2026-03-18T06:00:00'),
    ('45ad0e74-0368-4b88-9f0a-8895f5ccecae', '80914f95-47c8-49d2-84e0-0f935051bc64', '8fb7f31d-1bef-4b43-b5d1-df452e07369b', 17, '2026-03-27T17:00:00'),
    ('6a46d029-479b-465c-abae-a2ed61ad8b71', '80914f95-47c8-49d2-84e0-0f935051bc64', '5c6001b1-c3fa-45b9-9e2b-c354ddab9e9f', 17, '2026-03-26T08:00:00'),
    ('7869c7d8-5663-4f0e-817a-354fabcda464', '3398d81a-d09b-43c7-9d54-15d7502995fe', '9eebee0f-0522-49a4-adb4-3b67965936df', 17, '2026-06-12T04:00:00'),
    ('92d7ca83-b92c-4e1b-a6ec-ba901963f4bd', '8c6cc040-32ec-44cb-a629-9105f36a2d3a', 'c555c85e-1fe9-4ecc-b03f-5f65ee59437f', 7, '2026-02-17T05:00:00'),
    ('4cc317b0-3261-4076-b5a8-1e77f4de80b4', '71ca6220-994a-481e-b6e8-98d5b5e60a6a', '460234ea-88af-4970-b5b1-a29096ee1d8f', 7, '2026-06-09T15:00:00'),
    ('7c875e74-3e3a-446a-ae70-155fde7f7685', '11eb2929-680c-4832-a86b-7f06926745f0', 'd7c71b7d-cf3a-4715-82de-d2583a7d534f', 11, '2026-02-15T08:00:00'),
    ('6d50c395-4c1e-401d-869f-ae41bf2d0ebb', '64712568-1d4f-479e-808f-f6f0ceadc6ed', '3c0ee2e6-6cb5-43fe-92b9-0bb4ff14024d', 2, '2026-04-11T03:00:00')
;

-- gamification_streakrecord: 24 rows
INSERT INTO gamification_streakrecord (user_id, date, events_count, streak_count)
VALUES
    (1, '2026-06-04', 4, 19),
    (2, '2026-07-01', 4, 5),
    (3, '2026-06-28', 3, 13),
    (3, '2026-07-02', 3, 7),
    (4, '2026-06-23', 4, 9),
    (4, '2026-06-09', 4, 9),
    (5, '2026-06-18', 1, 18),
    (6, '2026-06-22', 2, 21),
    (7, '2026-06-09', 1, 1),
    (8, '2026-06-27', 1, 20),
    (9, '2026-06-26', 2, 16),
    (10, '2026-06-15', 2, 15),
    (11, '2026-06-09', 2, 20),
    (11, '2026-06-22', 5, 4),
    (12, '2026-06-24', 1, 19),
    (13, '2026-06-04', 3, 19),
    (14, '2026-06-21', 2, 3),
    (14, '2026-06-11', 5, 21),
    (15, '2026-06-30', 3, 20),
    (16, '2026-06-08', 5, 2),
    (17, '2026-06-16', 3, 3),
    (17, '2026-06-20', 5, 21),
    (18, '2026-07-03', 4, 16),
    (18, '2026-06-06', 1, 14)
;

-- gamification_pointtransaction: 30 rows
INSERT INTO gamification_pointtransaction (user_id, event_type, points_awarded, description, created_at)
VALUES
    (12, 'resource_milestone', 10, 'Resource reached 10 upvotes', '2026-03-11T09:00:00'),
    (15, 'resource_milestone', 10, 'Resource reached 10 upvotes', '2026-06-14T09:00:00'),
    (14, 'submit_answer', 8, 'Submitted an answer', '2026-04-01T09:00:00'),
    (17, 'resource_milestone', 10, 'Resource reached 10 upvotes', '2026-05-30T09:00:00'),
    (18, 'attend_session', 12, 'Attended a study group session', '2026-05-03T09:00:00'),
    (15, 'answer_accepted', 20, 'Answer accepted by question author', '2026-03-20T09:00:00'),
    (9, 'answer_endorsed', 15, 'Answer endorsed by an expert solver', '2026-03-16T09:00:00'),
    (8, 'attend_session', 12, 'Attended a study group session', '2026-03-06T09:00:00'),
    (3, 'answer_endorsed', 15, 'Answer endorsed by an expert solver', '2026-03-13T09:00:00'),
    (15, 'submit_answer', 8, 'Submitted an answer', '2026-03-29T09:00:00'),
    (15, 'submit_resource', 6, 'Submitted a new resource', '2026-04-16T09:00:00'),
    (13, 'answer_endorsed', 15, 'Answer endorsed by an expert solver', '2026-06-30T09:00:00'),
    (16, 'attend_session', 12, 'Attended a study group session', '2026-05-23T09:00:00'),
    (6, 'answer_accepted', 20, 'Answer accepted by question author', '2026-06-06T09:00:00'),
    (12, 'attend_session', 12, 'Attended a study group session', '2026-05-31T09:00:00'),
    (11, 'answer_endorsed', 15, 'Answer endorsed by an expert solver', '2026-03-13T09:00:00'),
    (9, 'submit_resource', 6, 'Submitted a new resource', '2026-07-02T09:00:00'),
    (17, 'submit_answer', 8, 'Submitted an answer', '2026-06-23T09:00:00'),
    (8, 'resource_milestone', 10, 'Resource reached 10 upvotes', '2026-05-12T09:00:00'),
    (16, 'submit_resource', 6, 'Submitted a new resource', '2026-03-28T09:00:00'),
    (8, 'resource_milestone', 10, 'Resource reached 10 upvotes', '2026-05-04T09:00:00'),
    (16, 'answer_accepted', 20, 'Answer accepted by question author', '2026-03-24T09:00:00'),
    (1, 'post_question', 5, 'Posted a new question', '2026-05-27T09:00:00'),
    (8, 'answer_accepted', 20, 'Answer accepted by question author', '2026-04-06T09:00:00'),
    (8, 'answer_endorsed', 15, 'Answer endorsed by an expert solver', '2026-04-10T09:00:00'),
    (12, 'answer_accepted', 20, 'Answer accepted by question author', '2026-04-24T09:00:00'),
    (17, 'answer_endorsed', 15, 'Answer endorsed by an expert solver', '2026-05-10T09:00:00'),
    (18, 'answer_endorsed', 15, 'Answer endorsed by an expert solver', '2026-05-19T09:00:00'),
    (15, 'answer_endorsed', 15, 'Answer endorsed by an expert solver', '2026-05-25T09:00:00'),
    (9, 'submit_answer', 8, 'Submitted an answer', '2026-06-18T09:00:00')
;

-- notifications_notification: 26 rows
INSERT INTO notifications_notification (id, recipient_id, notification_type, payload, is_read, created_at)
VALUES
    ('d9b6570c-caba-4d08-9ff0-7c1a90d5deef', '7', 'answer_accepted', '{"answer_id": "3cb33977-8fb7-402b-8f7d-c489bfd4be2a", "question_id": "72943e93-781f-4165-a77d-b93f4fc11f9e"}'::jsonb, FALSE, '2026-05-30T09:00:00'),
    ('c40e9b3f-eac3-4c74-8c3c-d4218bf5d528', '6', 'answer_endorsed', '{"answer_id": "05daf4f8-f992-43f8-a526-3e2308b6023e", "question_id": "88edaf09-9525-416f-828f-03a75ed0af87"}'::jsonb, FALSE, '2026-06-03T09:00:00'),
    ('d24df30d-657d-4cc9-9794-3cb36ba6b89f', '9', 'resource_upvote_milestone', '{"resource_id": "6c38dc6d-a444-4e9a-9bed-f5f47bc2f6ec", "resource_title": "Terraform: Up & Running", "votes": 10}'::jsonb, FALSE, '2026-05-26T09:00:00'),
    ('4007d002-2f61-403e-9288-6ab1aadee732', '10', 'new_answer', '{"question_id": "28164d15-cab8-4ff1-a25e-90e735cb0b36", "question_title": "Best practices for securing a public-facing REST API"}'::jsonb, FALSE, '2026-06-19T09:00:00'),
    ('977000cc-f915-42a3-988f-232c1391c932', '12', 'answer_endorsed', '{"answer_id": "4d26b408-d38e-4b86-a337-9d118da8f817", "question_id": "28164d15-cab8-4ff1-a25e-90e735cb0b36"}'::jsonb, TRUE, '2026-05-19T09:00:00'),
    ('d74626f7-99a8-4b27-93ee-016daba39373', '18', 'answer_endorsed', '{"answer_id": "4b3f9ba0-f445-45d3-b195-cc1e84ac1ceb", "question_id": "159f4579-927f-48de-9ae1-31445dfac97c"}'::jsonb, TRUE, '2026-06-30T09:00:00'),
    ('69b00e17-c87d-46a9-ae7f-7406192b0445', '18', 'answer_accepted', '{"answer_id": "2540c95d-7b79-47a7-ac8b-d50fa2fa2ecd", "question_id": "693dea47-0740-4cd7-b989-99fd907ab092"}'::jsonb, TRUE, '2026-05-24T09:00:00'),
    ('58a7c924-c820-409d-95bb-aea571525600', '16', 'new_answer', '{"question_id": "40e9c76e-ffff-4d1d-a7ff-8d41019d5d5f", "question_title": "Why does my recursive Fibonacci function take forever for n > 35?"}'::jsonb, FALSE, '2026-06-15T09:00:00'),
    ('69b5bc35-fd03-48af-8741-a8409ec08e99', '16', 'group_formed', '{"group_id": "dc2b97aa-aff8-4b5d-bc7f-36892753d70e", "group_name": "calc-stats-support"}'::jsonb, FALSE, '2026-06-22T09:00:00'),
    ('802b42ce-c3ee-49ee-8041-aa6b6a3b3cb9', '2', 'answer_accepted', '{"answer_id": "3398d81a-d09b-43c7-9d54-15d7502995fe", "question_id": "7405a608-3d35-453b-8b2b-1fe21547cd8e"}'::jsonb, TRUE, '2026-05-12T09:00:00'),
    ('c4a97f74-bc6f-41bb-a615-f00d65306752', '3', 'group_formed', '{"group_id": "dc2b97aa-aff8-4b5d-bc7f-36892753d70e", "group_name": "calc-stats-support"}'::jsonb, TRUE, '2026-05-28T09:00:00'),
    ('88f34be8-473f-4cbe-98cd-aba97bd221c4', '2', 'answer_endorsed', '{"answer_id": "736a91d1-6bea-4d3a-bf9a-917bc21296a9", "question_id": "dde446d9-364b-496e-80c4-fb9e1a13251e"}'::jsonb, FALSE, '2026-05-04T09:00:00'),
    ('0cc7eeb4-fe09-4e20-86c1-a16707aa2941', '10', 'new_answer', '{"question_id": "9504f6ac-56d1-46f1-b353-9501fca545ce", "question_title": "What is Zero Trust and why is everyone suddenly talking about it?"}'::jsonb, TRUE, '2026-05-29T09:00:00'),
    ('1989bff6-e6bb-42db-aa6b-a8c063e24a5a', '14', 'meeting_reminder', '{"group_id": "a2f3b464-cd22-427f-bff0-a5b4659c8d30", "group_name": "ml-ai-circle", "starts_in_minutes": 30}'::jsonb, FALSE, '2026-06-09T09:00:00'),
    ('16e40fa4-1e1b-4197-939d-970464c7ef08', '15', 'group_formed', '{"group_id": "d08df352-0fd2-44fe-8187-6d3af1904da7", "group_name": "security-ctf-crew"}'::jsonb, FALSE, '2026-06-06T09:00:00'),
    ('3e52d39b-168f-4ef2-878a-78136a2fe19d', '10', 'meeting_reminder', '{"group_id": "5491b699-f262-4261-a0c5-f1cb7d5073da", "group_name": "algo-study-group", "starts_in_minutes": 30}'::jsonb, FALSE, '2026-05-17T09:00:00'),
    ('aaa1159d-4a5f-4e0b-abff-911af573c7e3', '4', 'chat_message', '{"group_id": "a2f3b464-cd22-427f-bff0-a5b4659c8d30", "preview": "Hey, are we still meeting later?"}'::jsonb, FALSE, '2026-06-20T09:00:00'),
    ('b30b9320-4657-430f-9637-f523a78c078b', '9', 'resource_upvote_milestone', '{"resource_id": "e3754448-9efb-490e-b84c-cdf375c0093a", "resource_title": "Understanding Memory Management in C", "votes": 10}'::jsonb, TRUE, '2026-06-18T09:00:00'),
    ('24a15263-d91e-424a-a473-d3a0442fcfe8', '6', 'meeting_reminder', '{"group_id": "5491b699-f262-4261-a0c5-f1cb7d5073da", "group_name": "algo-study-group", "starts_in_minutes": 30}'::jsonb, TRUE, '2026-07-03T09:00:00'),
    ('103826ad-880f-4cb5-95da-774db78d2bdd', '14', 'group_formed', '{"group_id": "dc2b97aa-aff8-4b5d-bc7f-36892753d70e", "group_name": "calc-stats-support"}'::jsonb, FALSE, '2026-07-01T09:00:00'),
    ('54bc786a-3c27-4731-aaca-82867bf704b3', '8', 'answer_accepted', '{"answer_id": "2540c95d-7b79-47a7-ac8b-d50fa2fa2ecd", "question_id": "693dea47-0740-4cd7-b989-99fd907ab092"}'::jsonb, FALSE, '2026-05-20T09:00:00'),
    ('80de6c45-2c54-44b4-895b-9a1d55c7a423', '15', 'new_answer', '{"question_id": "c7db82e3-dde0-4bc4-aad4-b64ade9df691", "question_title": "How does Diffie-Hellman key exchange relate to modular arithmetic?"}'::jsonb, TRUE, '2026-05-05T09:00:00'),
    ('43ffef4b-4107-4bd5-a447-fb2006f5edca', '9', 'chat_message', '{"group_id": "a2f3b464-cd22-427f-bff0-a5b4659c8d30", "preview": "Hey, are we still meeting later?"}'::jsonb, FALSE, '2026-06-26T09:00:00'),
    ('4b85dc41-5903-401d-b5f4-6eeba964387e', '18', 'answer_endorsed', '{"answer_id": "dde1f435-d098-4355-ad03-4db987ab1317", "question_id": "46d82552-6b8d-43c5-8279-507fa08dc94b"}'::jsonb, TRUE, '2026-05-06T09:00:00'),
    ('1fe3637e-1878-47b2-96d3-d9f56f74c802', '9', 'chat_message', '{"group_id": "a2f3b464-cd22-427f-bff0-a5b4659c8d30", "preview": "Hey, are we still meeting later?"}'::jsonb, TRUE, '2026-06-30T09:00:00'),
    ('18132677-5932-43ee-87de-1421891f6ac8', '6', 'chat_message', '{"group_id": "d08df352-0fd2-44fe-8187-6d3af1904da7", "preview": "Hey, are we still meeting later?"}'::jsonb, FALSE, '2026-05-17T09:00:00')
;

-- chat_chatmessage: 26 rows
INSERT INTO chat_chatmessage (id, group_id, sender_id, content, sent_at)
VALUES
    ('311df927-9c99-4a23-95c9-283d025fbda6', '5491b699-f262-4261-a0c5-f1cb7d5073da', 1, 'Hey everyone, are we still on for the quicksort walkthrough tonight?', '2026-06-30T07:00:00'),
    ('68527fc0-269c-4970-a98f-10fa4e0770a2', '5491b699-f262-4261-a0c5-f1cb7d5073da', 2, 'Yep, 7pm as planned. I''ll bring the median-of-three example.', '2026-06-30T07:07:00'),
    ('5c474e0e-8c5d-4bbe-abca-510e28d53f23', '5491b699-f262-4261-a0c5-f1cb7d5073da', 16, 'Can we also touch on memoization for the Fibonacci problem set?', '2026-06-30T07:14:00'),
    ('ff39ae63-941b-41dd-ad16-9aae927d0fa9', '5491b699-f262-4261-a0c5-f1cb7d5073da', 2, 'Sure, good idea — it''s a natural follow-up.', '2026-06-30T07:21:00'),
    ('de913e97-a8fe-4e83-9fca-c4fa3e6f3c4c', '5491b699-f262-4261-a0c5-f1cb7d5073da', 1, 'Perfect, see everyone there!', '2026-06-30T07:28:00'),
    ('669ddbb0-a93e-4045-947d-e0de13422d61', 'a2f3b464-cd22-427f-bff0-a5b4659c8d30', 7, 'Sharing the Hugging Face course link in the resources tab, worth going through before Thursday.', '2026-06-30T07:35:00'),
    ('b0425a7f-f7d9-4ecd-b6af-f36f25fdd281', 'a2f3b464-cd22-427f-bff0-a5b4659c8d30', 13, 'Started it already, the attention section finally made transformers click for me.', '2026-06-30T07:42:00'),
    ('96b3fc35-4ef2-4753-9d57-5e1d3717dd21', 'a2f3b464-cd22-427f-bff0-a5b4659c8d30', 8, 'Same here honestly. Are we doing a CV session next or sticking with NLP?', '2026-06-30T07:49:00'),
    ('eafd9a49-b1c3-416c-b446-37c13be8d5a8', 'a2f3b464-cd22-427f-bff0-a5b4659c8d30', 7, 'Let''s finish NLP first, then move to CV the following week.', '2026-06-30T07:56:00'),
    ('19dc924f-591b-4089-9628-c3f7d421fc06', 'a2f3b464-cd22-427f-bff0-a5b4659c8d30', 9, 'Can I join even though I''m more physics-leaning? Curious about the ML side.', '2026-06-30T08:03:00'),
    ('a43d78ac-8438-4f17-96f7-c7eb87b321c1', 'a2f3b464-cd22-427f-bff0-a5b4659c8d30', 7, 'Of course, the more the merrier!', '2026-06-30T08:10:00'),
    ('a4ed4a6d-9a66-4676-ad04-79d9a598bfc8', 'd08df352-0fd2-44fe-8187-6d3af1904da7', 14, 'New CTF drops Saturday, anyone in?', '2026-06-30T08:17:00'),
    ('4551993d-7a58-4fc5-bdc2-edbe0dddd9de', 'd08df352-0fd2-44fe-8187-6d3af1904da7', 12, 'In. Crypto challenges again I hope.', '2026-06-30T08:24:00'),
    ('c26b7a5b-2a52-45b6-a6dd-e95f46256dd8', 'd08df352-0fd2-44fe-8187-6d3af1904da7', 14, 'Looks like a mix — crypto, web, and a pwn category this time.', '2026-06-30T08:31:00'),
    ('867676b1-ef44-41ae-9e53-697f9a050568', 'd08df352-0fd2-44fe-8187-6d3af1904da7', 12, 'Even better. Let''s team up like last time.', '2026-06-30T08:38:00'),
    ('d9e24dad-00d7-4bc7-9b4b-e73d31e5bdd0', 'd08df352-0fd2-44fe-8187-6d3af1904da7', 14, 'Deal. I''ll set up a shared doc for notes.', '2026-06-30T08:45:00'),
    ('26f99bb5-398d-491b-8ab6-7c4350a197f7', 'dc2b97aa-aff8-4b5d-bc7f-36892753d70e', 3, 'Anyone free to go over related rates problems before Friday''s quiz?', '2026-06-30T08:52:00'),
    ('e4ecdb7e-efa0-4028-a96d-12a8f66a45fd', 'dc2b97aa-aff8-4b5d-bc7f-36892753d70e', 4, 'I can hop on a call tomorrow evening, works for me.', '2026-06-30T08:59:00'),
    ('06760fae-7730-4bb5-9cd5-b0b274bcae27', 'dc2b97aa-aff8-4b5d-bc7f-36892753d70e', 10, 'Mind if I join too? Central Limit Theorem is also still fuzzy for me.', '2026-06-30T09:06:00'),
    ('af199c8c-f4a1-4333-85ec-d35f5ed7c4cb', 'dc2b97aa-aff8-4b5d-bc7f-36892753d70e', 4, 'Not at all, we can cover both — different topics but same energy needed.', '2026-06-30T09:13:00'),
    ('3549e586-411a-4833-bbe2-063ca71d0c2b', 'dc2b97aa-aff8-4b5d-bc7f-36892753d70e', 3, 'Thank you both, really appreciate it.', '2026-06-30T09:20:00'),
    ('2eb1d948-ef7b-4f46-a4d4-393608862016', 'dc2b97aa-aff8-4b5d-bc7f-36892753d70e', 11, 'I''ll join for the CLT part, happy to explain the intuition.', '2026-06-30T09:27:00'),
    ('2fbbe981-16d4-4348-b324-fac61f6c633f', '5491b699-f262-4261-a0c5-f1cb7d5073da', 12, 'Random q — does anyone have notes from last week''s session? I missed it.', '2026-06-30T09:34:00'),
    ('8dece6ee-58e9-4e75-95cb-c49a4bd53af4', '5491b699-f262-4261-a0c5-f1cb7d5073da', 2, 'I''ll upload mine to the resources tab tonight.', '2026-06-30T09:41:00'),
    ('aa5b2e03-309a-418c-bd88-4709e0cbd328', 'a2f3b464-cd22-427f-bff0-a5b4659c8d30', 17, 'Not really an ML person but this group''s energy is contagious, mind if I lurk?', '2026-06-30T09:48:00'),
    ('b8d7b8b2-5802-45dd-9a52-a76c7776b404', 'd08df352-0fd2-44fe-8187-6d3af1904da7', 18, 'Following along for the crypto/graph-theory overlap in some of these challenges, interesting stuff.', '2026-06-30T09:55:00')
;

-- ============================================================
-- Reconcile denormalized counters after all rows are inserted
-- ============================================================
UPDATE users_user u
SET points_total = COALESCE((
    SELECT SUM(pt.points_awarded) FROM gamification_pointtransaction pt WHERE pt.user_id = u.id
), 0);

UPDATE resources_resource r
SET net_votes = COALESCE((
    SELECT SUM(v.value) FROM resources_vote v WHERE v.resource_id = r.id
), 0);

-- Rank users by points_total (simple dense rank, ties share a rank)
WITH ranked AS (
    SELECT id, DENSE_RANK() OVER (ORDER BY points_total DESC) AS rnk
    FROM users_user
)
UPDATE users_user u
SET rank_position = ranked.rnk
FROM ranked
WHERE u.id = ranked.id;

-- We inserted explicit bigint ids for users_user (1..18), so bump
-- its identity/sequence forward past what we used, otherwise the next
-- Django-created user will collide with one of these ids.
SELECT setval(
    pg_get_serial_sequence('users_user', 'id'),
    GREATEST((SELECT MAX(id) FROM users_user), 1)
);

COMMIT;
-- ============================================================
-- Study groups + memberships + meeting links seed data
-- Generated 2026-07-03T09:00:00
--
-- Matches apps.groups.models: StudyGroup / Membership / MeetingLink
-- (groups_studygroup / groups_membership / groups_meetinglink)
--
-- Requires: demo_seed_data.sql already run (users_user rows 1-18,
-- tags_tag rows). subject_tag values below are all LEAF-level tags,
-- matching StudyGroup.subject_tag's limit_choices_to.
--
-- The first 4 groups reuse the exact UUIDs already referenced by
-- chat_chatmessage.group_id and notifications_notification.payload
-- in demo_seed_data.sql, so that data now resolves against real rows.
--
-- Membership cap check: max groups per user = 3 (limit 3).
-- ============================================================

BEGIN;

-- groups_studygroup: 9 rows
INSERT INTO groups_studygroup (id, name, subject_tag_id, formation_type, max_members, created_by_id, created_at)
VALUES
    ('5491b699-f262-4261-a0c5-f1cb7d5073da', 'Algo Study Group', (SELECT id FROM tags_tag WHERE slug = 'algorithms'), 'manual', 8, 2, '2026-05-04T09:00:00'),
    ('a2f3b464-cd22-427f-bff0-a5b4659c8d30', 'ML/AI Circle', (SELECT id FROM tags_tag WHERE slug = 'machine-learning'), 'manual', 10, 7, '2026-05-09T09:00:00'),
    ('d08df352-0fd2-44fe-8187-6d3af1904da7', 'Security & CTF Crew', (SELECT id FROM tags_tag WHERE slug = 'cryptography'), 'manual', 6, 14, '2026-05-16T09:00:00'),
    ('dc2b97aa-aff8-4b5d-bc7f-36892753d70e', 'Calc & Stats Support', (SELECT id FROM tags_tag WHERE slug = 'chain-rule'), 'automated', 8, 4, '2026-04-24T09:00:00'),
    ('938ea7aa-ae03-4786-9947-f3a7c67e7975', 'Web Dev Warriors', (SELECT id FROM tags_tag WHERE slug = 'restful-apis'), 'manual', 6, 5, '2026-05-24T09:00:00'),
    ('7e52f8e3-a12f-439f-98b4-3ab057501850', 'Cloud & DevOps Guild', (SELECT id FROM tags_tag WHERE slug = 'kubernetes-orchestration'), 'automated', 8, 8, '2026-05-29T09:00:00'),
    ('47efd643-9f89-4258-90d2-f33857244e61', 'Engineering Study Hall', (SELECT id FROM tags_tag WHERE slug = 'fluid-dynamics'), 'manual', 10, 6, '2026-06-03T09:00:00'),
    ('ea4a30b7-73ad-49bf-94b0-9775493ac82d', 'Discrete Math & Graph Theory Circle', (SELECT id FROM tags_tag WHERE slug = 'graph-theory'), 'manual', 6, 18, '2026-06-08T09:00:00'),
    ('1ee6c196-b2e9-4fac-9b75-aa6a807b19a3', 'Physics Problem Solvers', (SELECT id FROM tags_tag WHERE slug = 'newtonian-mechanics'), 'automated', 8, 9, '2026-06-13T09:00:00')
;

-- groups_membership: 27 rows
INSERT INTO groups_membership (id, group_id, user_id, joined_at)
VALUES
    ('12cf5510-367d-41e4-8a32-c088ddbffea2', '5491b699-f262-4261-a0c5-f1cb7d5073da', 2, '2026-05-05T09:00:00'),
    ('d55c9f89-cb73-49d1-bd26-f5a52bb6cc05', '5491b699-f262-4261-a0c5-f1cb7d5073da', 1, '2026-05-07T09:00:00'),
    ('8f0cb3dd-ade3-4bed-b2b6-db8458a56c56', '5491b699-f262-4261-a0c5-f1cb7d5073da', 16, '2026-05-08T09:00:00'),
    ('64bb1a5e-753f-40d3-b3e6-ca08f8918b41', '5491b699-f262-4261-a0c5-f1cb7d5073da', 12, '2026-05-09T09:00:00'),
    ('388da09d-5ad6-4004-bdcd-948b6ba00e1a', 'a2f3b464-cd22-427f-bff0-a5b4659c8d30', 7, '2026-05-10T09:00:00'),
    ('4381aa68-0381-401c-b52d-1cbc3fbe23e7', 'a2f3b464-cd22-427f-bff0-a5b4659c8d30', 13, '2026-05-12T09:00:00'),
    ('39b430ee-38a9-4264-9f77-dd43fec895a7', 'a2f3b464-cd22-427f-bff0-a5b4659c8d30', 8, '2026-05-13T09:00:00'),
    ('11bc8790-1954-4771-bb61-5541c896f1dc', 'a2f3b464-cd22-427f-bff0-a5b4659c8d30', 17, '2026-05-14T09:00:00'),
    ('1d433163-044e-4acd-b45f-42a505af66d7', 'd08df352-0fd2-44fe-8187-6d3af1904da7', 14, '2026-05-17T09:00:00'),
    ('9910fffb-8154-4b08-8ef6-4316ce5d76ec', 'd08df352-0fd2-44fe-8187-6d3af1904da7', 12, '2026-05-19T09:00:00'),
    ('6ee3c46b-f54b-429e-9bbd-1fba307903c0', 'd08df352-0fd2-44fe-8187-6d3af1904da7', 18, '2026-05-20T09:00:00'),
    ('7a14448e-6f8b-4e9f-bea7-0debb0749940', 'dc2b97aa-aff8-4b5d-bc7f-36892753d70e', 4, '2026-04-25T09:00:00'),
    ('61884800-4f69-41a6-8c8c-3f1c955cc593', 'dc2b97aa-aff8-4b5d-bc7f-36892753d70e', 3, '2026-04-27T09:00:00'),
    ('b618e5ef-5a3d-422c-92bc-93e90f82693e', 'dc2b97aa-aff8-4b5d-bc7f-36892753d70e', 10, '2026-04-28T09:00:00'),
    ('329df805-3f47-469b-87aa-15eb5b1d7916', 'dc2b97aa-aff8-4b5d-bc7f-36892753d70e', 11, '2026-04-29T09:00:00'),
    ('4c86b691-2265-46ce-bd3c-3680708ca360', '938ea7aa-ae03-4786-9947-f3a7c67e7975', 5, '2026-05-25T09:00:00'),
    ('d072f6ba-b905-4986-ab22-45a0b96fd0e5', '938ea7aa-ae03-4786-9947-f3a7c67e7975', 16, '2026-05-27T09:00:00'),
    ('92b6cffc-d0a0-4923-af55-c22da5965971', '938ea7aa-ae03-4786-9947-f3a7c67e7975', 17, '2026-05-28T09:00:00'),
    ('fad99618-9baa-4280-8c02-5c9b05ac1492', '7e52f8e3-a12f-439f-98b4-3ab057501850', 8, '2026-05-30T09:00:00'),
    ('1e2827d1-65ce-4216-8ca3-a314878d22f8', '7e52f8e3-a12f-439f-98b4-3ab057501850', 13, '2026-06-01T09:00:00'),
    ('6d1d22a7-1b22-42d2-9dd9-e1bc151a42b1', '7e52f8e3-a12f-439f-98b4-3ab057501850', 17, '2026-06-02T09:00:00'),
    ('bc7017de-0aad-45fe-94fb-9e70e80cc07f', '47efd643-9f89-4258-90d2-f33857244e61', 6, '2026-06-04T09:00:00'),
    ('15125a3d-b955-4ec8-a0ee-2cfdd3ccbb07', '47efd643-9f89-4258-90d2-f33857244e61', 15, '2026-06-06T09:00:00'),
    ('9d5d920d-0ee3-45dd-b654-be26a5639743', 'ea4a30b7-73ad-49bf-94b0-9775493ac82d', 18, '2026-06-09T09:00:00'),
    ('1a99197f-6cbc-4c07-b741-756cf63953bb', 'ea4a30b7-73ad-49bf-94b0-9775493ac82d', 3, '2026-06-11T09:00:00'),
    ('9d92a704-ba63-421a-85c8-b6b8ed41b0db', '1ee6c196-b2e9-4fac-9b75-aa6a807b19a3', 9, '2026-06-14T09:00:00'),
    ('d68920f0-88d8-4b44-9e46-f561c332c7d9', '1ee6c196-b2e9-4fac-9b75-aa6a807b19a3', 6, '2026-06-16T09:00:00')
;

-- groups_meetinglink: 21 rows
INSERT INTO groups_meetinglink (id, group_id, provider, meeting_url, scheduled_at, created_at)
VALUES
    ('16ae81b2-842b-4ac9-b0d7-99090469bfc9', '5491b699-f262-4261-a0c5-f1cb7d5073da', 'google_meet', 'https://meet.google.com/demo-5491b699', '2026-06-26T09:00:00', '2026-06-24T09:00:00'),
    ('55c7c38b-6919-4de7-b245-f31d28050d9e', '5491b699-f262-4261-a0c5-f1cb7d5073da', 'zoom', 'https://zoom.us/j/6031059222', '2026-07-06T09:00:00', '2026-07-02T09:00:00'),
    ('f6e57cb8-d484-4127-a451-8f656f35038b', 'a2f3b464-cd22-427f-bff0-a5b4659c8d30', 'zoom', 'https://zoom.us/j/9519328701', '2026-06-26T08:00:00', '2026-06-24T08:00:00'),
    ('5ffc2fab-c7b4-41ad-b46f-2caf80a09e2c', 'a2f3b464-cd22-427f-bff0-a5b4659c8d30', 'google_meet', 'https://meet.google.com/demo--cd22-42', '2026-07-06T10:00:00', '2026-07-02T08:00:00'),
    ('64aa1e14-f29d-47f0-aa78-cb3f2cf864be', 'd08df352-0fd2-44fe-8187-6d3af1904da7', 'google_meet', 'https://meet.google.com/demo-d08df352', '2026-06-26T07:00:00', '2026-06-24T07:00:00'),
    ('9727421f-e94a-453a-bdf4-4d55e9a9df57', 'd08df352-0fd2-44fe-8187-6d3af1904da7', 'zoom', 'https://zoom.us/j/1930274437', '2026-07-06T11:00:00', '2026-07-02T07:00:00'),
    ('81194224-f364-4940-8db6-468a67e60f7d', 'dc2b97aa-aff8-4b5d-bc7f-36892753d70e', 'zoom', 'https://zoom.us/j/8979710527', '2026-06-26T06:00:00', '2026-06-24T06:00:00'),
    ('e0801e3a-80ab-456d-afb4-11e3e78fbb4d', 'dc2b97aa-aff8-4b5d-bc7f-36892753d70e', 'google_meet', 'https://meet.google.com/demo--aff8-4b', '2026-07-06T12:00:00', '2026-07-02T06:00:00'),
    ('ba7a9e8d-f883-4c81-8715-0fa1a2a17303', '938ea7aa-ae03-4786-9947-f3a7c67e7975', 'google_meet', 'https://meet.google.com/demo-938ea7aa', '2026-06-26T05:00:00', '2026-06-24T05:00:00'),
    ('a4d382db-d163-4063-a80b-a794cd6915e2', '938ea7aa-ae03-4786-9947-f3a7c67e7975', 'zoom', 'https://zoom.us/j/1237846254', '2026-07-06T13:00:00', '2026-07-02T05:00:00'),
    ('e139f0b9-7d64-4437-bca4-8d4dcedc69bb', '7e52f8e3-a12f-439f-98b4-3ab057501850', 'zoom', 'https://zoom.us/j/7946086045', '2026-06-26T04:00:00', '2026-06-24T04:00:00'),
    ('1f9014ed-e13a-4f54-8d57-332ef032fbfa', '7e52f8e3-a12f-439f-98b4-3ab057501850', 'google_meet', 'https://meet.google.com/demo--a12f-43', '2026-07-06T14:00:00', '2026-07-02T04:00:00'),
    ('7d9bc78c-603a-47a8-81b3-2a2260d2b489', '47efd643-9f89-4258-90d2-f33857244e61', 'google_meet', 'https://meet.google.com/demo-47efd643', '2026-06-26T03:00:00', '2026-06-24T03:00:00'),
    ('6b8e1f1b-d6f5-4c84-9eef-0c53580b5921', '47efd643-9f89-4258-90d2-f33857244e61', 'zoom', 'https://zoom.us/j/7354537172', '2026-07-06T15:00:00', '2026-07-02T03:00:00'),
    ('24b4a8a6-9382-4a30-8fda-4d454339a6a4', 'ea4a30b7-73ad-49bf-94b0-9775493ac82d', 'zoom', 'https://zoom.us/j/6240978886', '2026-06-26T02:00:00', '2026-06-24T02:00:00'),
    ('7a46a8cd-2189-4d50-a858-a6081fa19f70', 'ea4a30b7-73ad-49bf-94b0-9775493ac82d', 'google_meet', 'https://meet.google.com/demo--73ad-49', '2026-07-06T16:00:00', '2026-07-02T02:00:00'),
    ('b2637f6f-bd02-4b97-b003-b1437f79a84d', '1ee6c196-b2e9-4fac-9b75-aa6a807b19a3', 'google_meet', 'https://meet.google.com/demo-1ee6c196', '2026-06-26T01:00:00', '2026-06-24T01:00:00'),
    ('3e45a177-c9ae-4ea2-8a15-a2d22bc3e613', '1ee6c196-b2e9-4fac-9b75-aa6a807b19a3', 'zoom', 'https://zoom.us/j/8817674347', '2026-07-06T17:00:00', '2026-07-02T01:00:00'),
    ('37796ff2-906a-44ed-aed3-25fe4d8084f1', '5491b699-f262-4261-a0c5-f1cb7d5073da', 'zoom', 'https://zoom.us/j/5646600883', NULL, '2026-07-01T09:00:00'),
    ('09e52c5f-6714-42cd-8ae0-730ded39196d', 'a2f3b464-cd22-427f-bff0-a5b4659c8d30', 'zoom', 'https://zoom.us/j/2721981696', NULL, '2026-07-01T09:00:00'),
    ('061f8cb6-7525-4d9b-b392-82a138118cb4', 'd08df352-0fd2-44fe-8187-6d3af1904da7', 'zoom', 'https://zoom.us/j/449789944', NULL, '2026-07-01T09:00:00')
;

COMMIT;
-- ============================================================
-- Group chat seed data
-- Generated 2026-07-03T09:00:00
--
-- Adds conversations for the 5 groups that had no chat_chatmessage
-- rows yet (Web Dev Warriors, Cloud & DevOps Guild, Engineering
-- Study Hall, Discrete Math & Graph Theory Circle, Physics Problem
-- Solvers). The original 4 groups already have chat from
-- demo_seed_data.sql -- this file doesn't duplicate those.
--
-- Every sender here is an actual member of that group, per
-- demo_groups_seed.sql's groups_membership rows.
--
-- Requires: demo_seed_data.sql and demo_groups_seed.sql already run.
-- ============================================================

BEGIN;

-- chat_chatmessage: 27 rows
INSERT INTO chat_chatmessage (id, group_id, sender_id, content, sent_at)
VALUES
    ('d43db67e-272b-4d90-bebd-ab8efe5a1eaf', '938ea7aa-ae03-4786-9947-f3a7c67e7975', 5, 'Anyone tried versioning APIs with URL paths vs headers? Debating it for the group project.', '2026-07-01T08:00:00'),
    ('67b8454d-028d-4a79-ad8e-feb13d6391f1', '938ea7aa-ae03-4786-9947-f3a7c67e7975', 16, 'URL path (/v1/...) every time IMO — way easier to debug and test in the browser.', '2026-07-01T08:06:00'),
    ('99dfc3a6-efae-4ea4-900a-a91918e69059', '938ea7aa-ae03-4786-9947-f3a7c67e7975', 17, 'Agreed, headers are cleaner in theory but a pain when you''re just curling something quickly.', '2026-07-01T08:12:00'),
    ('160358ee-5cfa-4a48-9ac0-06ae60f3313b', '938ea7aa-ae03-4786-9947-f3a7c67e7975', 5, 'Fair, going with /v1/ then. Also does anyone have a good WebSocket auth pattern? Token in the query string feels wrong.', '2026-07-01T08:18:00'),
    ('de1b209a-fd71-41b5-8696-d1fa3adb6e7e', '938ea7aa-ae03-4786-9947-f3a7c67e7975', 17, 'Send the token in the initial handshake message after connecting instead of the URL — keeps it out of logs.', '2026-07-01T08:24:00'),
    ('d2bbadc3-7e62-4df0-a9be-630095aff96a', '938ea7aa-ae03-4786-9947-f3a7c67e7975', 16, 'That''s what we did for the chat feature actually, works well.', '2026-07-01T08:30:00'),
    ('24e5cb23-3b3e-4b1d-918a-fa4c60037e2a', '7e52f8e3-a12f-439f-98b4-3ab057501850', 8, 'Anyone else fighting with Lambda cold starts this week? Feels like a losing battle.', '2026-07-01T08:00:00'),
    ('84b9d13e-819c-4266-b736-9dcd5dc162d1', '7e52f8e3-a12f-439f-98b4-3ab057501850', 13, 'Provisioned concurrency on the hot endpoints helped us a lot, worth the extra cost.', '2026-07-01T08:06:00'),
    ('085a67c1-8225-406a-adad-e1e545ba0425', '7e52f8e3-a12f-439f-98b4-3ab057501850', 17, '+1, also trim your deployment package — heavy imports at module load time make it way worse.', '2026-07-01T08:12:00'),
    ('e2fc6183-1381-4c84-b6e6-2f5006635bd9', '7e52f8e3-a12f-439f-98b4-3ab057501850', 8, 'Good call, our bundle has a full pandas import we don''t even use anymore.', '2026-07-01T08:18:00'),
    ('65e3cc1d-96f0-45ce-8b92-ff4d4e5e5633', '7e52f8e3-a12f-439f-98b4-3ab057501850', 13, 'Classic. On a different note, my pod''s still crash-looping, going to bring it up at the next session.', '2026-07-01T08:24:00'),
    ('ba50e6c5-1908-4c71-a00e-74c8a8d72e95', '7e52f8e3-a12f-439f-98b4-3ab057501850', 17, 'Bring the `kubectl describe pod` output, not just logs — usually the real reason is in there.', '2026-07-01T08:30:00'),
    ('34ce8126-9cca-4132-814c-8de813fc7f17', '47efd643-9f89-4258-90d2-f33857244e61', 6, 'Does anyone have a clean derivation for the pulley problem from this week''s set? Keep messing up the signs.', '2026-07-01T08:00:00'),
    ('44e203cf-5282-4af2-a139-63143680a59e', '47efd643-9f89-4258-90d2-f33857244e61', 15, 'Pick one direction as positive for the whole system before you write anything down — that''s usually where it goes wrong.', '2026-07-01T08:06:00'),
    ('937ff5d7-f596-4621-a78b-9079c84e05e9', '47efd643-9f89-4258-90d2-f33857244e61', 6, 'That actually fixed it, thank you!', '2026-07-01T08:12:00'),
    ('dbeb744f-0df9-4099-b333-8cb2bf674a18', '47efd643-9f89-4258-90d2-f33857244e61', 15, 'No problem. Also open to swapping notes — I could use help with structural load calculations sometime.', '2026-07-01T08:18:00'),
    ('5c6c37e7-91eb-4fc4-836b-718cabc69451', '47efd643-9f89-4258-90d2-f33857244e61', 6, 'Deal, let''s do a session on that next week.', '2026-07-01T08:24:00'),
    ('e66d7fd7-d551-4587-9ee2-9c1bd3316772', 'ea4a30b7-73ad-49bf-94b0-9775493ac82d', 18, 'Anyone want to work through the graph coloring proof together before Friday?', '2026-07-01T08:00:00'),
    ('b4a82c2f-ba00-452a-aa27-36db5d067450', 'ea4a30b7-73ad-49bf-94b0-9775493ac82d', 3, 'Yes please, chromatic number bounds are not clicking for me yet.', '2026-07-01T08:06:00'),
    ('19e6ac44-0e6b-4550-b6ed-0b40d703cda5', 'ea4a30b7-73ad-49bf-94b0-9775493ac82d', 18, 'Start with greedy coloring as the baseline bound, then look for extra structure like bipartiteness — tightens it a lot.', '2026-07-01T08:12:00'),
    ('93259cab-0fb3-49be-8c53-056b5810910e', 'ea4a30b7-73ad-49bf-94b0-9775493ac82d', 3, 'That helps a lot actually. Sending over my attempt so far.', '2026-07-01T08:18:00'),
    ('fc7ac842-f116-4805-b7d9-fd6693fecc8a', 'ea4a30b7-73ad-49bf-94b0-9775493ac82d', 18, 'Looks solid, just double check the base case.', '2026-07-01T08:24:00'),
    ('99fa959d-80b8-4ad8-8fd2-53890b57a036', '1ee6c196-b2e9-4fac-9b75-aa6a807b19a3', 9, 'Studying entropy this week and the formula makes sense but the intuition still doesn''t fully land for me.', '2026-07-01T08:00:00'),
    ('f42de2d8-b394-4a44-801c-f46dc9c39a3f', '1ee6c196-b2e9-4fac-9b75-aa6a807b19a3', 6, 'Think of it as: there are just way more disordered configurations than ordered ones, so systems drift toward them statistically.', '2026-07-01T08:06:00'),
    ('634e95d3-3f08-4bfd-8d39-9e9a5d1795e8', '1ee6c196-b2e9-4fac-9b75-aa6a807b19a3', 9, 'Oh that actually helps a lot, thank you.', '2026-07-01T08:12:00'),
    ('641b9077-eede-4dbe-a8a9-19c1fed99cb6', '1ee6c196-b2e9-4fac-9b75-aa6a807b19a3', 6, 'Also are we still doing the Newtonian mechanics review before the quiz?', '2026-07-01T08:18:00'),
    ('8736bc96-5bda-416f-bda7-9839cccc2713', '1ee6c196-b2e9-4fac-9b75-aa6a807b19a3', 9, 'Yes, same time as usual. I''ll bring the pulley problem we worked through.', '2026-07-01T08:24:00')
;

COMMIT;