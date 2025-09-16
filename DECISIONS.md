# Decisions

## Improvements I Would Add with More Time

- **More robust ingestion pipeline**  
  Migrate to a fully asynchronous architecture:  
  `API Gateway → Lambda → S3 (maybe pre-signed URL) → S3 Event → Lambda → SQS → Lambda → DynamoDB`
  This would solve the problem to save many claims at once.
  This also would improve scalability, fault tolerance, and allow safe reprocessing of files.

- **Observability**  
  Add metrics, structured logging, and alerts, along with a simple dashboard to monitor ingestion performance and error rates.

- **Backpressure handling**  
  Implement exponential backoff and retries for transient failures when writing to DynamoDB or any other resources/apis.

- **Pagination support**  
  Extend the retrieval endpoint to support pagination, making it easier to query large datasets.

---

## My thoughts on: Project Structure (Design)

- Chose a layered architecture: **Presentation → infra →  application → Domain**.  
- **Trade-off**: A single-file approach would be quicker for a small project, but layered architecture improves maintainability, testability, and scalability.  
- **Justification**: Even though the assignment allowed for a simpler solution, I invested in a more robust architecture with a domain model and repository.  
  - This decision also served a personal purpose: creating a reusable setup that I could bring into future projects or propose as a standard to my team.  
  - Clean, decoupled architecture from the start pays off in long-term maintainability and scalability.

---

## My thoughts on:: Ingestion Endpoint (POST /claims)

- **Initial plan**: Asynchronous, event-driven pipeline using S3, SQS, and DynamoDB.  
  - Scalable, reliable, and supports reprocessing.  

- **Final choice (MVP due to time)**:  
  ```
  API Gateway → Lambda → DynamoDB
  ```  
  Assumed CSV files wouldn’t be too large, so a simpler synchronous flow was sufficient for the exercise.

---

## My thoughts on: Claims Retrieval (GET /claims)

- Considered two approaches:  
  1. **Scan with filters** – simple but inefficient; only viable for rare reads.  
  2. **Global Secondary Index (GSI)** – small extra write cost, but enables efficient queries at scale.  

- **Decision**: Use a GSI, since we expect more reads than writes.  
- Also compute `totalAmount` sum in memory after fetching results.  
- With more time I would add pagination.

---

## My thoughts on: Retrieve a Single Claim (GET /claims/:id)

- Straightforward lookup by `claimId` (partition key).  
- Returns a single claim if found, otherwise `NotFoundError`.

---

## Presentation Formatting

- All formatting handled in the **presentation layer**.  
- Utility functions / DTOs (e.g., `ClaimViewModel`) transform domain entities into API responses.  
- **Reasoning**: keeps domain pure and business-focused, while leaving presentation concerns at the API boundary.
