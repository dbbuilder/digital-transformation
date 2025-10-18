# Glossary of Digital Transformation Terms

**Quick reference for terminology used throughout the documentation**

---

## Transformation Framework Terms

### Four-Corner Model
The visual framework with four quadrants representing current and future states of UI and Data/AI platform, with transformation proceeding diagonally from Future UI and Current Data to their opposites.

### Dual-Path Approach
The methodology offering two transformation paths:
- **AI-Included Path**: Leverages AI for automation, prediction, and intelligence
- **AI-Free Path**: Traditional modernization without AI/ML technologies

### Tier
An architectural layer of the system. Five tiers in this framework:
1. **UI Tier**: User interface and experience
2. **Mid-Tier / API Tier**: Application logic and services
3. **Data Tier**: Databases, data warehouses, and data platforms
4. **Cloud Platform Tier**: Infrastructure, compute, networking
5. **AI/External Tier**: AI services and third-party integrations

### Bridging
The process of defining transformation steps from present state to future state, typically through transitional states (Present → Transitional → Future).

### Transformation Phase
Major stages of transformation:
- **Discovery & Alignment** (Weeks 1-4): Assess current, define future, prioritize
- **Foundation** (Weeks 4-8): Cloud baseline, data migration prep, governance
- **Modernization** (Weeks 8-16): Build new components, migrate workloads
- **Intelligence Layer** (Weeks 16-24, AI path only): Implement AI/ML capabilities
- **Optimization & Governance** (Weeks 24-32): Optimize, monitor, govern

---

## Technical Architecture Terms

### SPA (Single-Page Application)
A web application that loads a single HTML page and dynamically updates content without full page reloads. Examples: React apps, Vue apps.

### State Management
The practice of managing application data (state) in a predictable way. Common tools: Redux, Zustand, Pinia.

### IndexedDB
Browser-based NoSQL database for storing large amounts of structured data locally (offline-first).

### Service Worker
A JavaScript script that runs in the background, separate from the web page, enabling offline functionality and caching.

### PWA (Progressive Web App)
A web application that uses modern capabilities to deliver app-like experiences, including offline support and installability.

### IaC (Infrastructure-as-Code)
Managing and provisioning infrastructure through code rather than manual processes. Tools: Terraform, Bicep, CloudFormation.

### Microservices
Architectural style where an application is composed of small, independent services that communicate via APIs.

### API Gateway
A server that acts as an entry point for API requests, handling routing, authentication, rate limiting, etc.

### Containerization
Packaging software and its dependencies into containers for consistent deployment. Tool: Docker.

### Kubernetes (K8s)
Open-source platform for automating deployment, scaling, and management of containerized applications.

### Serverless
Cloud computing model where the cloud provider manages servers, and you only pay for compute time used. Examples: AWS Lambda, Azure Functions.

### ETL vs. ELT
- **ETL (Extract, Transform, Load)**: Transform data before loading into destination
- **ELT (Extract, Load, Transform)**: Load raw data first, transform in destination

### Data Lakehouse
Modern data architecture combining benefits of data lakes (flexibility, low cost) and data warehouses (structure, performance). Uses formats like Delta Lake, Iceberg.

### RAG (Retrieval-Augmented Generation)
AI technique where a language model retrieves relevant documents before generating responses, grounding answers in facts.

---

## Agile and Project Management Terms

### Sprint
A fixed time period (typically 2-4 weeks) during which specific work is completed and made ready for review.

### Story Points
A relative estimation metric used to estimate the effort required to complete a user story.

### Velocity
The average amount of work (in story points) a team completes per sprint.

### User Story
A short description of a feature from an end-user perspective. Format: "As a [user], I want [goal], so that [benefit]."

### Epic
A large user story that is broken down into smaller stories.

### Backlog
A prioritized list of work items (stories, tasks, bugs) to be completed.

### Sprint Planning
Meeting at the start of a sprint to decide what work will be completed.

### Daily Stand-up (Daily Scrum)
Brief daily meeting (15 min) where team members share progress, plans, and blockers.

### Sprint Review / Demo
Meeting at the end of a sprint to demonstrate completed work to stakeholders.

### Sprint Retrospective
Meeting at the end of a sprint to reflect on what went well, what didn't, and how to improve.

### Definition of Done (DoD)
Checklist of criteria that must be met for a story to be considered complete (e.g., code reviewed, tested, documented, deployed).

### Phase Gate
Decision point between major project phases where stakeholders assess progress and approve continuation.

---

## Compliance and Legal Terms

### GDPR (General Data Protection Regulation)
EU regulation on data protection and privacy, effective May 2018. Key rights: access, rectification, erasure, portability.

### CCPA (California Consumer Privacy Act)
California law granting consumers rights over their personal information. Effective January 2020.

### HIPAA (Health Insurance Portability and Accountability Act)
US law protecting sensitive patient health information (PHI).

### PCI-DSS (Payment Card Industry Data Security Standard)
Security standard for organizations handling credit card information.

### SOX (Sarbanes-Oxley Act)
US law requiring public companies to maintain financial reporting controls and audit trails.

### SOC 2 (Service Organization Control 2)
Audit framework for service providers based on Trust Services Criteria (Security, Availability, Confidentiality, Privacy).

### ISO 27001
International standard for information security management systems (ISMS).

### PII (Personal Identifiable Information)
Information that can identify an individual (name, email, SSN, etc.).

### PHI (Protected Health Information)
Health information that can be linked to an individual (under HIPAA).

### Data Subject
An individual whose personal data is being processed (GDPR term).

### Data Controller
Entity that determines purposes and means of processing personal data (GDPR term).

### Data Processor
Entity that processes personal data on behalf of the controller (GDPR term).

### Data Processing Agreement (DPA)
Contract between data controller and processor defining how personal data will be processed.

### Privacy Impact Assessment (PIA) / Data Protection Impact Assessment (DPIA)
Assessment of privacy risks associated with data processing, required for high-risk processing under GDPR.

### Right to Erasure (Right to be Forgotten)
GDPR right allowing individuals to request deletion of their personal data.

---

## AI and Machine Learning Terms

### AI Governance
Framework of policies, processes, and controls for responsible AI development and deployment.

### Responsible AI
Principles and practices ensuring AI systems are fair, transparent, accountable, safe, and respect privacy.

### Bias (in AI)
Systematic errors in AI models that lead to unfair outcomes for certain groups.

### Fairness Metrics
Quantitative measures of bias and fairness in AI models (e.g., demographic parity, equal opportunity).

### Explainability / Interpretability
The degree to which AI model decisions can be understood and explained to humans.

### SHAP (SHapley Additive exPlanations)
Method for explaining individual predictions of machine learning models.

### LIME (Local Interpretable Model-agnostic Explanations)
Technique for explaining predictions of any classifier by approximating it locally with an interpretable model.

### Model Card
Standardized documentation for machine learning models, describing intended use, performance, limitations, and ethical considerations.

### Model Drift
Degradation of model performance over time due to changes in data distribution or relationships.

### Data Drift
Changes in the statistical properties of input data over time.

### Hallucination (LLMs)
When a large language model generates plausible-sounding but false or nonsensical information.

### Prompt Injection
Attack where malicious input manipulates an AI model (especially LLMs) to bypass safety guardrails.

### RAG (Retrieval-Augmented Generation)
See Technical Architecture Terms above.

### Vector Database
Database optimized for storing and querying high-dimensional vectors (embeddings). Used in RAG systems.

### Embedding
Numerical representation of text, images, or other data in high-dimensional space.

### Fine-tuning
Process of adapting a pre-trained model to a specific task by training on task-specific data.

### MLOps (Machine Learning Operations)
Practices for deploying, monitoring, and maintaining ML models in production.

### Feature Store
Centralized repository for storing and serving features (input variables) for machine learning models.

### RLHF (Reinforcement Learning from Human Feedback)
Technique for training AI models using feedback from human reviewers to improve safety and alignment.

---

## Cloud and Platform Terms

### Cloud Provider
Company offering cloud computing services. Major providers: Microsoft Azure, Amazon Web Services (AWS), Google Cloud Platform (GCP).

### Compute
Processing resources (CPUs, GPUs) provided by cloud services.

### Storage
Cloud-based data storage. Types: Object storage (S3, Blob), Block storage, File storage.

### IaaS (Infrastructure as a Service)
Cloud model providing virtualized computing resources. You manage OS and applications.

### PaaS (Platform as a Service)
Cloud model providing platform for building apps without managing underlying infrastructure.

### SaaS (Software as a Service)
Cloud model where software is hosted and accessed via the internet (e.g., Salesforce, Office 365).

### Multi-Cloud
Using services from multiple cloud providers (e.g., Azure + AWS) to avoid vendor lock-in or leverage best-of-breed.

### Hybrid Cloud
Architecture combining on-premises infrastructure with cloud services.

### Landing Zone
Foundational cloud environment setup with networking, security, governance, and identity policies.

### Reserved Instance / Savings Plan
Commitment to use cloud resources for 1-3 years in exchange for significant discounts (30-70%).

### Spot Instance / Preemptible VM
Unused cloud capacity available at steep discounts (up to 90%) but can be interrupted.

### Auto-Scaling
Automatically adjusting compute resources based on demand.

### Load Balancer
Distributes incoming traffic across multiple servers to ensure availability and performance.

### CDN (Content Delivery Network)
Distributed network of servers that delivers content to users from the nearest geographic location.

### VNet / VPC (Virtual Network / Virtual Private Cloud)
Isolated network within a cloud provider.

### Firewall / WAF (Web Application Firewall)
Security system controlling network traffic. WAF specifically protects web applications.

### DDoS (Distributed Denial of Service)
Attack overwhelming a system with traffic. Cloud providers offer DDoS protection.

---

## Data Management Terms

### Data Warehouse
Centralized repository optimized for analytical queries (OLAP). Examples: Azure Synapse, Redshift, BigQuery.

### Data Lake
Storage repository holding vast amounts of raw data in native format. Examples: Azure Data Lake, AWS S3.

### OLTP (Online Transaction Processing)
Database systems optimized for transactional workloads (inserts, updates, deletes). Example: Azure SQL Database.

### OLAP (Online Analytical Processing)
Database systems optimized for complex queries and aggregations. Example: Data warehouses.

### NoSQL
Non-relational databases. Types: Document (MongoDB), Key-Value (Redis), Wide-Column (Cassandra), Graph (Neo4j).

### Data Lineage
Tracking data flow from source to destination, including transformations.

### Data Catalog
Inventory of data assets with metadata, lineage, and governance policies. Tools: Azure Purview, AWS Glue Catalog.

### Data Contract
Agreement defining schema, quality, SLA, and ownership of a dataset.

### CDC (Change Data Capture)
Technique for identifying and capturing changes in a database for replication or streaming.

### Partitioning
Dividing large tables into smaller, manageable pieces (partitions) for performance.

### Indexing
Creating data structures to speed up data retrieval.

### Materialized View
Pre-computed query results stored as a table for faster access.

### Star Schema / Snowflake Schema
Data modeling techniques for data warehouses. Star schema has one fact table and dimension tables; snowflake schema normalizes dimensions.

### Fact Table
Central table in a star schema containing measurable, quantitative data.

### Dimension Table
Table in a star schema providing descriptive attributes (e.g., customer, product, time).

---

## DevOps and CI/CD Terms

### CI/CD (Continuous Integration / Continuous Deployment)
Practices for automating software integration, testing, and deployment.

### Version Control
System for tracking changes to code. Tool: Git.

### Git Repository
Storage location for code managed by Git. Hosted on: GitHub, GitLab, Azure Repos, Bitbucket.

### Branch
Parallel version of code for developing features independently.

### Pull Request / Merge Request
Proposal to merge code changes from one branch to another, with code review.

### Pipeline
Automated workflow for building, testing, and deploying code.

### Build
Process of compiling code and dependencies into executable artifacts.

### Artifact
Output of a build process (e.g., compiled binary, Docker image, package).

### Deployment
Process of releasing software to an environment (dev, staging, production).

### Environment
Isolated instance of the application (e.g., development, staging, production).

### Blue-Green Deployment
Deployment strategy with two identical environments; traffic switched from old (blue) to new (green) version.

### Canary Deployment
Gradually rolling out changes to a small subset of users before full deployment.

### Feature Flag
Toggle to enable/disable features without deploying new code.

### Rollback
Reverting to a previous version of software after a failed deployment.

---

## Security Terms

### Authentication
Verifying identity of a user or system.

### Authorization
Determining what an authenticated user is allowed to do.

### OAuth 2.0
Industry-standard protocol for authorization.

### OpenID Connect (OIDC)
Identity layer on top of OAuth 2.0 for authentication.

### JWT (JSON Web Token)
Compact token format for securely transmitting information between parties.

### SSO (Single Sign-On)
Authentication allowing users to log in once and access multiple applications.

### MFA (Multi-Factor Authentication)
Authentication requiring two or more verification factors (e.g., password + SMS code).

### RBAC (Role-Based Access Control)
Access control based on user roles (e.g., admin, editor, viewer).

### Least Privilege
Security principle of granting minimum permissions necessary.

### Zero Trust
Security model assuming no user or system is trusted by default; always verify.

### Encryption at Rest
Encrypting data stored on disk.

### Encryption in Transit
Encrypting data during transmission (e.g., TLS/SSL).

### TLS/SSL (Transport Layer Security / Secure Sockets Layer)
Protocols for encrypting network communications. TLS 1.2+ required.

### Certificate
Digital document verifying identity of a server or client.

### PKI (Public Key Infrastructure)
System for managing digital certificates and encryption keys.

### Secrets Management
Secure storage and access control for sensitive data (API keys, passwords, certificates). Tools: Azure Key Vault, AWS Secrets Manager, HashiCorp Vault.

### SIEM (Security Information and Event Management)
System for aggregating and analyzing security logs to detect threats.

### Penetration Testing (Pen Testing)
Simulated cyber attack to identify vulnerabilities.

### Vulnerability Scan
Automated scan to identify known security vulnerabilities.

---

## Performance and Monitoring Terms

### Latency
Time delay between request and response (milliseconds).

### Throughput
Amount of work processed per unit of time (e.g., requests per second).

### p50, p95, p99 (Percentiles)
Performance metrics. p95 means 95% of requests are faster than this value.

### SLA (Service Level Agreement)
Commitment to uptime and performance (e.g., 99.9% uptime).

### SLO (Service Level Objective)
Target level of service (e.g., 95% of requests < 200ms).

### SLI (Service Level Indicator)
Metric measuring actual service performance (e.g., average response time).

### Uptime
Percentage of time a system is operational.

### Downtime
Period when a system is unavailable.

### MTTD (Mean Time to Detect)
Average time to detect an incident.

### MTTR (Mean Time to Resolve)
Average time to resolve an incident after detection.

### Observability
Ability to understand system internal state from external outputs (logs, metrics, traces).

### APM (Application Performance Monitoring)
Monitoring application performance and user experience. Tools: Datadog, New Relic, Application Insights.

### Distributed Tracing
Tracking requests across multiple services in microservices architecture.

### Logging
Recording events and errors for troubleshooting.

### Metrics
Quantitative measurements of system behavior (CPU, memory, request rate).

### Dashboard
Visual display of key metrics and KPIs.

### Alert
Automated notification when a metric crosses a threshold.

---

## Cost Management Terms

### FinOps (Financial Operations)
Practice of bringing financial accountability to cloud spending.

### TCO (Total Cost of Ownership)
Complete cost of a solution including initial purchase, operations, maintenance, and decommissioning.

### CapEx (Capital Expenditure)
Upfront cost for purchasing assets (e.g., servers, data centers).

### OpEx (Operating Expenditure)
Ongoing cost for operations (e.g., cloud subscriptions, salaries).

### Pay-as-you-go
Pricing model where you pay only for resources used (common in cloud).

### Chargeback
Allocating costs to specific teams or projects.

### Cost Allocation
Tagging and attributing cloud costs to cost centers.

### Right-Sizing
Adjusting resource sizes to match actual usage (avoiding over-provisioning).

---

## Acronyms Quick Reference

| Acronym | Full Term | Category |
|---------|-----------|----------|
| ADR | Architecture Decision Record | Architecture |
| AI | Artificial Intelligence | AI/ML |
| API | Application Programming Interface | Technical |
| ARB | Architecture Review Board | Governance |
| BAA | Business Associate Agreement | Compliance (HIPAA) |
| BI | Business Intelligence | Data |
| CCPA | California Consumer Privacy Act | Compliance |
| CDC | Change Data Capture | Data |
| CDN | Content Delivery Network | Cloud |
| CISO | Chief Information Security Officer | Security |
| CMS | Content Management System | Technical |
| CoE | Center of Excellence | Governance |
| COPPA | Children's Online Privacy Protection Act | Compliance |
| CRM | Customer Relationship Management | Business |
| CRUD | Create, Read, Update, Delete | Technical |
| CSP | Cloud Service Provider | Cloud |
| DDoS | Distributed Denial of Service | Security |
| DPA | Data Processing Agreement | Compliance |
| DPIA | Data Protection Impact Assessment | Compliance |
| DPO | Data Protection Officer | Compliance |
| DR | Disaster Recovery | Cloud |
| ELT | Extract, Load, Transform | Data |
| ETL | Extract, Transform, Load | Data |
| FCRA | Fair Credit Reporting Act | Compliance |
| FERPA | Family Educational Rights and Privacy Act | Compliance |
| GDPR | General Data Protection Regulation | Compliance |
| HA | High Availability | Cloud |
| HIPAA | Health Insurance Portability and Accountability Act | Compliance |
| IaC | Infrastructure-as-Code | Cloud |
| IAM | Identity and Access Management | Security |
| JWT | JSON Web Token | Security |
| K8s | Kubernetes | Cloud |
| KPI | Key Performance Indicator | Business |
| LLM | Large Language Model | AI/ML |
| MTTD | Mean Time to Detect | Monitoring |
| MTTR | Mean Time to Resolve | Monitoring |
| MFA | Multi-Factor Authentication | Security |
| ML | Machine Learning | AI/ML |
| MLOps | Machine Learning Operations | AI/ML |
| OIDC | OpenID Connect | Security |
| OLAP | Online Analytical Processing | Data |
| OLTP | Online Transaction Processing | Data |
| PCI-DSS | Payment Card Industry Data Security Standard | Compliance |
| PHI | Protected Health Information | Compliance |
| PIA | Privacy Impact Assessment | Compliance |
| PII | Personal Identifiable Information | Compliance |
| PKI | Public Key Infrastructure | Security |
| PM | Project Manager / Product Manager | Business |
| PMO | Project Management Office | Business |
| PWA | Progressive Web App | Technical |
| RAG | Retrieval-Augmented Generation | AI/ML |
| RBAC | Role-Based Access Control | Security |
| RLHF | Reinforcement Learning from Human Feedback | AI/ML |
| ROI | Return on Investment | Business |
| RPO | Recovery Point Objective | Cloud |
| RTO | Recovery Time Objective | Cloud |
| SaaS | Software as a Service | Cloud |
| SDLC | Software Development Lifecycle | Technical |
| SIEM | Security Information and Event Management | Security |
| SLA | Service Level Agreement | Business |
| SLI | Service Level Indicator | Monitoring |
| SLO | Service Level Objective | Monitoring |
| SOC 2 | Service Organization Control 2 | Compliance |
| SOX | Sarbanes-Oxley Act | Compliance |
| SPA | Single-Page Application | Technical |
| SQL | Structured Query Language | Data |
| SSO | Single Sign-On | Security |
| TCO | Total Cost of Ownership | Business |
| TLS/SSL | Transport Layer Security / Secure Sockets Layer | Security |
| UAT | User Acceptance Testing | Testing |
| UI/UX | User Interface / User Experience | Technical |
| VNet/VPC | Virtual Network / Virtual Private Cloud | Cloud |
| WAF | Web Application Firewall | Security |
| WCAG | Web Content Accessibility Guidelines | Compliance |

---

**Pro Tip**: Bookmark this glossary and use Ctrl+F / Cmd+F to quickly find terms as you read the documentation.
