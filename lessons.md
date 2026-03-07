# Zazmic CRM - Lessons Learned

> **Purpose**: After ANY user correction, update this file with the pattern, what went wrong, and how to prevent it in the future.

---

## 🗄️ Database & Connection Issues

### URL-Encode Special Characters in Passwords
- **Date**: 2026-03-01
- **Problem**: Deployment failed due to special characters in PostgreSQL password
- **Pattern**: Database passwords with `@`, `!`, `#`, etc. break connection strings
- **Solution**: Always use `urllib.parse.quote_plus()` for password encoding
- **Code Example**:
  ```python
  from urllib.parse import quote_plus
  password = quote_plus("CrmP@ssw0rd2026!@")
  DATABASE_URL = f"postgresql://crm_user:{password}@host/db"
  ```
- **Prevention Rule**: Never use raw passwords in connection strings

### SQLite vs PostgreSQL Connection Args
- **Date**: 2026-02-28
- **Problem**: SQLite needs `check_same_thread=False`, PostgreSQL does not
- **Pattern**: Different databases need different connection configurations
- **Solution**: Conditional connection args based on database type
- **Code Example**:
  ```python
  if "sqlite" in DATABASE_URL:
      connect_args = {"check_same_thread": False}
  else:
      connect_args = {}
  ```
- **Prevention Rule**: Check database type before setting connection args

---

## 🚀 Deployment Issues

### Environment Variable Type Conflicts
- **Date**: 2026-02-27
- **Problem**: Mixing secret and literal env vars caused deployment failure
- **Pattern**: Cloud Run fails when env var exists as both secret and literal
- **Solution**: Clear all env vars, then set them fresh with correct type
- **Prevention Rule**: Choose ONE type per env var (secret OR literal, never both)

### Shell Special Characters in Deployment
- **Date**: 2026-02-26
- **Problem**: Password with `!` character broke shell commands
- **Pattern**: Special shell characters need escaping in deployment scripts
- **Solution**: URL-encode passwords or use Secret Manager
- **Prevention Rule**: Always use Secret Manager for sensitive credentials

### Dockerfile Port Configuration
- **Date**: 2026-02-25
- **Problem**: Container port didn't match Cloud Run expected port
- **Pattern**: Cloud Run expects port 8080 by default
- **Solution**: Set `PORT` env var or configure Dockerfile to expose correct port
- **Prevention Rule**: Always verify port configuration matches deployment platform

---

## 🎨 Frontend Design & UX

### Data-Rich vs Minimalist Design
- **Date**: 2026-02-28
- **Problem**: Initial minimalist design didn't match CRM use case
- **Pattern**: Analytics/CRM dashboards need data density, not minimal aesthetics
- **Solution**: Switched to Zoho Analytics-inspired comprehensive dashboards
- **Prevention Rule**: Match design approach to use case (data tools = data-rich UI)

### Sidebar Spacing Issues
- **Date**: 2026-02-27
- **Problem**: Content overlapped with sidebar
- **Pattern**: Fixed positioning without proper margin/padding
- **Solution**: Add left margin equal to sidebar width on main content
- **Prevention Rule**: Test responsive layouts at multiple screen sizes

---

## 🔐 Authentication & OAuth

### OAuth Configuration Complexity
- **Date**: 2026-02-26
- **Problem**: Google OAuth redirect URLs need exact match
- **Pattern**: OAuth providers are strict about redirect URL configuration
- **Solution**: Set exact redirect URLs in Google Cloud Console
- **Prevention Rule**: Document OAuth setup steps with exact URLs

---

## 🧪 Testing & Quality

### Missing Test Coverage for Edge Cases
- **Date**: TBD
- **Problem**: 
- **Pattern**: 
- **Solution**: 
- **Prevention Rule**: 

---

## 📝 Code Quality & Architecture

### File Conflicts with Multiple Agents
- **Date**: 2026-02-20
- **Problem**: Two agents editing same file simultaneously
- **Pattern**: Concurrent edits cause merge conflicts
- **Solution**: One agent per workspace/feature branch
- **Prevention Rule**: Assign clear ownership boundaries to each agent

---

## 🔄 Git & Version Control

### Feature Branch Workflow
- **Date**: TBD
- **Problem**: 
- **Pattern**: 
- **Solution**: 
- **Prevention Rule**: 

---

## 📊 General Best Practices

### Always Verify Before Marking Complete
- **Pattern**: Tasks marked complete without testing
- **Solution**: Run tests, check logs, demonstrate functionality works
- **Prevention Rule**: "Would a staff engineer approve this?" test

### Plan First for Complex Tasks
- **Pattern**: Jumping into implementation without planning
- **Solution**: Use Plan Mode for any task with 3+ steps
- **Prevention Rule**: Write plan in todo.md, get approval, then implement

---

**Template for New Lessons**:
```markdown
### Lesson Title
- **Date**: YYYY-MM-DD
- **Problem**: What went wrong
- **Pattern**: Why it happened
- **Solution**: How we fixed it
- **Code Example**: (if applicable)
- **Prevention Rule**: Rule to prevent recurrence
```

---

**Last Updated**: 2026-03-01
