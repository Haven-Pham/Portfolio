-- SYNTHETIC training data; no employer records are used.
-- SQLite: for first run, execute the CREATE TABLE statements, then use
-- the SQLite CLI to import orders.csv / shipments.csv with headers skipped.
CREATE TABLE IF NOT EXISTS orders (
  order_id TEXT PRIMARY KEY,
  order_date TEXT NOT NULL,
  channel TEXT NOT NULL,
  warehouse TEXT NOT NULL,
  order_value REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS shipments (
  order_id TEXT PRIMARY KEY,
  dispatch_date TEXT NOT NULL,
  delivered_date TEXT NOT NULL,
  promised_date TEXT NOT NULL,
  FOREIGN KEY(order_id) REFERENCES orders(order_id)
);

-- Query 1: Order-level delivery performance.
SELECT o.order_id, o.channel, o.warehouse, o.order_value,
       CAST(julianday(s.delivered_date)-julianday(o.order_date) AS INTEGER) AS lead_days,
       CASE WHEN s.delivered_date > s.promised_date THEN 1 ELSE 0 END AS is_late
FROM orders AS o
INNER JOIN shipments AS s ON s.order_id = o.order_id
ORDER BY o.order_id;

-- Query 2: KPI groups — shipment-level denominator, no double counting.
WITH fulfillment AS (
  SELECT o.channel, o.warehouse,
         julianday(s.delivered_date)-julianday(o.order_date) AS lead_days,
         CASE WHEN s.delivered_date > s.promised_date THEN 1 ELSE 0 END AS is_late
  FROM orders o
  JOIN shipments s ON s.order_id = o.order_id
)
SELECT channel, warehouse, COUNT(*) AS shipment_count,
       ROUND(AVG(lead_days), 2) AS average_lead_days,
       SUM(is_late) AS late_shipments,
       ROUND(100.0 * AVG(is_late), 1) AS late_rate_pct
FROM fulfillment
GROUP BY channel, warehouse
ORDER BY channel, warehouse;

-- Query 3: Compare each shipment's delivery lead time with its channel average.
WITH fulfillment AS (
  SELECT o.order_id, o.channel,
         julianday(s.delivered_date)-julianday(o.order_date) AS lead_days
  FROM orders o JOIN shipments s ON s.order_id = o.order_id
)
SELECT order_id, channel, lead_days,
       ROUND(AVG(lead_days) OVER (PARTITION BY channel), 2) AS channel_average_days
FROM fulfillment
ORDER BY channel, order_id;
