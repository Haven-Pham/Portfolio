# E-Commerce Customer Cohort, Retention & Profitability Analysis

## Overview
This project delivers a comprehensive cohort retention, customer segmentation, and profitability analysis using synthetic e-commerce transaction data. By tracking behavioral acquisition cohorts across monthly and quarterly intervals, the analysis evaluates customer churn trajectories, compares B2C (Consumer) versus B2B (Corporate) retention stability, and examines net profitability contributions across annual customer income brackets.

## Business Questions
1. How effectively does the business retain newly acquired customers over time?
2. How does retention vary across customer cohorts?
3. How do retention patterns differ between Consumer and Corporate customers?
4. Which income groups contribute most to profitability?
5. What retention actions are suggested by the observed patterns?

## Analytical Approach
1. **Data ingestion and quality checks**: Load relational tables and audit structural schema, types, and dimensions.
2. **Customer cohort construction**: Identify first-purchase baselines and compute normalized cohort distance indices.
3. **Monthly retention analysis**: Calculate percentage retention matrices and heatmap visualizations for 2022 cohorts.
4. **Quarterly retention analysis**: Aggregate longitudinal trends into quarterly periods to measure macro churn.
5. **Customer segment comparison**: Contrast Consumer and Corporate cohort retention trajectories side-by-side.
6. **Profitability analysis**: Partition customer income tiers and evaluate cumulative profit volumes alongside profit margins.
7. **Business interpretation**: Extract key behavioral insights from empirical cohort curves.
8. **Recommendations**: Formulate actionable customer-retention and promotion strategies.

## Key Findings
- **The Retention Cliff**: Customer retention experiences a steep drop-off of over 90% immediately following Month 0, indicating an initial transactional acquisition model with limited spontaneous re-engagement.
- **Segment Differentiation**: Corporate customers exhibit slightly higher long-tail retention stability compared to individual Consumer accounts.
- **Income Bracket Profitability**: Low Income customers generate the highest absolute cumulative profit (~$504.5k), while Medium Income customers ($50k–$80k) yield the highest observed profit margin of approximately 16.56%.

## Business Recommendations
1. **Strengthen Early-Stage Engagement**: Introduce targeted post-purchase follow-up flows within the first 30–60 days to encourage a second purchase and alleviate the initial steep churn rate.
2. **Develop Segment-Specific Strategies**: Tailor dedicated account-management and re-ordering cadences for Corporate accounts while maintaining promotional engagement for Consumers.
3. **Targeted Promotional Economics**: Align marketing spend by income tier—sustaining volume campaigns for Low-Income buyers while offering margin-optimized promotions for Medium-Income buyers.
4. **Monitor Retention ROI**: Prioritize customer retention initiatives while measuring whether improved retention rates translate into sustainable unit profitability.

## Tools & Technologies
- Python 3.13
- Pandas & NumPy
- Matplotlib & Seaborn
- Cohort Analysis
- Customer Retention Analysis
- Customer Segmentation
- Profitability Analysis

## Data Availability
This project uses synthetic educational datasets created/provided for analytical practice.

The datasets do not represent real customer information or confidential company data.

The four datasets included in this repository are:
- `Customer.csv`
- `EcomSales.csv`
- `Product.csv`
- `Region.csv`

They are included so that the notebook can be reproduced from the public repository.

Synthetic educational dataset. No real customer or confidential company data are included.

## Project Structure
```
projects/
└── ecommerce_customer_cohort_retention_profitability/
    ├── ecommerce_customer_cohort_retention_profitability_analysis.ipynb
    ├── README.md
    └── data/
        ├── Customer.csv
        ├── EcomSales.csv
        ├── Product.csv
        ├── Region.csv
        └── README.md
```

## Limitations
- **Synthetic Data**: The dataset is synthetic and designed for educational/analytical demonstration.
- **Observational Nature**: Cohort retention patterns describe historical transactions but do not establish causality.
- **Profitability Metrics**: Differences across income brackets reflect historical transactions in the sample and should not be interpreted as causal income effects.

## Author
Pham Hong Hieu
