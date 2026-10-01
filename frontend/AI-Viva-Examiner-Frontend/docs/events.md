# Event contract

- `question.started`: a question becomes active.
- `question.text.delta`: incremental examiner text.
- `question.audio.chunk`: optional examiner audio.
- `answer.received`: candidate answer accepted.
- `topic.changed`: active topic changes.
- `interview.ended`: session completed or ended.

Components should use `InterviewService`, not depend on transport details.
