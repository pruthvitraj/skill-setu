# Relationships

- User 1—1 Student | Tpo | Recruiter (by role)
- University 1—N Department, Tpo, Student
- Company 1—N Recruiter, Job, PlacementDrive
- Student 1—N Resume, AssessmentAttempt, SkillScore, Application, Interview
- Student 1—1 active Roadmap (`targetRole` unique active constraint in service)
- Job 1—N Application → ApplicationHistory
- PlacementDrive N—N eligible students (array of refs)
- Conversation 1—N Message (participants: two User ids)
- Notification N—1 User
