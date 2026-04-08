const { query } = require('../config/database');

const createReview = async (req, res) => {
  const { project_id, rating, title, content, on_time, communication, quality, professionalism } = req.body;

  const projectResult = await query(
    "SELECT * FROM projects WHERE id = $1 AND status = 'completed' AND (freelancer_id = $2 OR client_id = $2)",
    [project_id, req.user.id]
  );
  if (projectResult.rows.length === 0) return res.status(404).json({ error: 'Projeto não encontrado ou não finalizado' });

  const project = projectResult.rows[0];
  const reviewed_id = req.user.id === project.freelancer_id ? project.client_id : project.freelancer_id;

  const existing = await query('SELECT id FROM reviews WHERE project_id=$1 AND reviewer_id=$2', [project_id, req.user.id]);
  if (existing.rows.length > 0) return res.status(409).json({ error: 'Você já avaliou este projeto' });

  const result = await query(
    `INSERT INTO reviews (project_id, reviewer_id, reviewed_id, rating, title, content, on_time, communication, quality, professionalism)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [project_id, req.user.id, reviewed_id, rating, title, content, on_time, communication, quality, professionalism]
  );

  // Atualizar trust_score
  const avgResult = await query(
    'SELECT AVG((rating + COALESCE(communication,rating) + COALESCE(quality,rating) + COALESCE(professionalism,rating))::numeric/4) as avg FROM reviews WHERE reviewed_id = $1',
    [reviewed_id]
  );
  const avg = parseFloat(avgResult.rows[0].avg || 0);
  await query('UPDATE users SET trust_score = $1 WHERE id = $2', [avg.toFixed(2), reviewed_id]);

  res.status(201).json({ review: result.rows[0] });
};

const getUserReviews = async (req, res) => {
  const result = await query(
    `SELECT r.*, u.full_name AS reviewer_name, u.avatar_url AS reviewer_avatar, p.title AS project_title
     FROM reviews r
     JOIN users u ON r.reviewer_id = u.id
     JOIN projects p ON r.project_id = p.id
     WHERE r.reviewed_id = $1 AND r.is_public = true
     ORDER BY r.created_at DESC`,
    [req.params.userId]
  );
  res.json({ reviews: result.rows });
};

module.exports = { createReview, getUserReviews };
