# Supply Chain SQL — Reproducible Starter (SYNTHETIC DATA)

This **teaching starter** is included to demonstrate project documentation. It is **not** a completed employer project and does **not** represent the author's actual employer KPIs. All 12 orders and 12 shipments in the CSV files are invented and are deliberately small so that results can be checked by hand.

## Business question

How can a logistics analyst distinguish late shipments from orders with longer delivery lead times? Which warehouses and sales channels appear in the *synthetic* exercise?

## Schema

- `orders.csv`: order_id, order_date, channel, warehouse, order_value
- `shipments.csv`: order_id, dispatch_date, delivered_date, promised_date

All dates are ISO 8601. One shipment per order. No missing values in the starter dataset.

## Reproduce in SQLite

1. Create empty `demo.db` database and import the two CSV tables (`orders`, `shipments`) using SQLite CLI `.mode csv` and `.import` after creating schema from `analysis.sql`.
2. Run the SELECT queries in `analysis.sql` to inspect order-level fulfillment and grouped summaries.
3. Validate `is_late`: it equals 1 only when `delivered_date > promised_date`.

Use this starter as a foundation. Replace the synthetic dataset with an authorized public dataset before claiming external results. Never upload employer/client data without permission.

## Portfolio publication status

Starter template supplied with website v2. **No validated public case-study conclusions yet.**
