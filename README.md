# AI Recruitment System - Frontend

Frontend application for an AI-powered recruitment screening system.

Candidates can select a job position, enter their information, upload a PDF CV, optionally provide a GitHub profile, and receive an AI-generated candidate-job fit analysis.

Recruiters can view evaluated applications through the recruitment dashboard.

## Features

### Candidate Application

Candidates can provide:

- Full Name
- Email
- Phone Number
- Years of Experience
- Job Position
- Skills
- GitHub Username / URL
- PDF Resume / CV

### AI Result

After submission, the candidate receives:

- Fit Score /100
- Classification
- Risk Level
- AI Decision
- Evaluation Reason
- Missing Skills
- Recommended Skills
- GitHub Analysis

### Recruitment Dashboard

The dashboard displays:

- Total evaluated applications
- Average AI Fit Score
- Strong Matches
- AI Rejected candidates
- Recent applications
- Candidate name
- Applied position
- Fit score
- Classification
- AI decision
- Application date

## Technologies

- Next.js
- React
- TypeScript
- Tailwind CSS
- REST APIs
- FormData / Multipart File Upload

## Supported Job Positions

The system supports multiple roles, including:

- Frontend Developer
- Backend Developer
- Full Stack Developer
- Data Science Intern
- Software Engineer
- IT Support Engineer
- Network Support Engineer
- UI/UX Designer

## AI Decision Logic

| Fit Score | Classification | Decision |
|---|---|---|
| 75-100 | Strong Match | Shortlist |
| 45-74 | Needs Review | Human Review |
| 0-44 | Weak Match | Reject |

## Environment Configuration

Create a `.env.local` file in the frontend directory.

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000