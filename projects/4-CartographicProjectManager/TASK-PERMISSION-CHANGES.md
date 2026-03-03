# Task Permission Changes - Special Users Can Update Status

## Problem Statement
According to the specification, when a client creates a task and assigns it to a special user (e.g., a manager), the special user needs to be able to update the task status to mark it as done.

**Specification Inconsistency:**
- Section 8.1 says Special Users have ✗ for "Modify any task"
- But the task workflow (Section 10.2) requires assignees to mark tasks as "Done"

## Solution Implemented

### Backend Changes

**File:** `backend/src/presentation/controllers/task.controller.ts`

**1. Added permission check to `update()` method:**
```typescript
// Permission check: Admin, task creator, or task assignee can update
const canUpdate = currentUser.role === 'ADMINISTRATOR' 
  || existingTask.creatorId === currentUser.id 
  || existingTask.assigneeId === currentUser.id;

if (!canUpdate) {
  sendError(res, 'You do not have permission to update this task', HTTP_STATUS.FORBIDDEN);
  return;
}
```

**2. Added permission check to `delete()` method:**
```typescript
// Permission check: Only admin or task creator can delete
const canDelete = currentUser.role === 'ADMINISTRATOR' 
  || existingTask.creatorId === currentUser.id;

if (!canDelete) {
  sendError(res, 'You do not have permission to delete this task', HTTP_STATUS.FORBIDDEN);
  return;
}
```

### Frontend (Already Correct)

**File:** `src/application/services/authorization.service.ts`

The `canModifyTask()` method already allows:
```typescript
// Admin can modify all tasks
if (user.role === UserRole.ADMINISTRATOR) return true;

// Task creator and assignee can modify
if (task.creatorId === userId || task.assigneeId === userId) return true;
```

## Permission Matrix (Updated)

| Action | Administrator | Client | Special User |
|--------|---------------|--------|--------------|
| Create tasks | ✓ | ✓ (assign to admin only) | ✗ |
| Modify own tasks | ✓ | ✓ | N/A |
| Modify assigned tasks | ✓ | ✓ | ✓ **NEW** |
| Delete own tasks | ✓ | ✓ | ✗ |
| Delete any task | ✓ | ✗ | ✗ |

## Test Scenarios

### Scenario 1: Client assigns task to Special User
1. **Setup:**
   - Client (role: CLIENT) creates project
   - Client creates task and assigns to Special User (role: SPECIAL_USER)
   
2. **Expected Behavior:**
   - ✓ Client can create task assigned to special user
   - ✓ Special user can view task
   - ✓ Special user can change status: PENDING → IN_PROGRESS → PERFORMED
   - ✓ Client can confirm task: PERFORMED → COMPLETED
   - ✗ Special user CANNOT delete task
   - ✗ Special user CANNOT change assignee

### Scenario 2: Special User modifies task description
1. **Setup:**
   - Task assigned to Special User
   
2. **Expected Behavior:**
   - ✓ Special user can change task status
   - ✓ Special user can add comments
   - ✗ Special user should NOT be able to change description (only status/comments)
   
**Note:** Current implementation allows assignees to modify all fields. Consider adding field-level restrictions:
- Assignees can only change: status, comments
- Creator can change: all fields (description, priority, assignee, dueDate, etc.)

### Scenario 3: Client creates task for another client
1. **Expected Behavior:**
   - ✗ Should be rejected (not implemented yet in create method)

## Testing Steps

### 1. Test Special User Status Update (Main Fix)
```bash
# In browser console:
# 1. Login as client
# 2. Create project
# 3. Create task assigned to a special user
# 4. Logout, login as special user
# 5. Try to update task status
# Expected: Should succeed ✓
```

### 2. Test Delete Permission
```bash
# As special user, try to delete assigned task
# Expected: Should fail with 403 Forbidden ✓
```

### 3. Test Unrelated User
```bash
# As another client (not creator, not assignee)
# Try to update task
# Expected: Should fail with 403 Forbidden ✓
```

## Security Improvements Made

**Before:**
- ❌ Backend had NO permission checks on task update
- ❌ Backend had NO permission checks on task delete  
- ❌ Any authenticated user could modify/delete any task

**After:**
- ✅ Backend validates user is admin, creator, or assignee before update
- ✅ Backend validates user is admin or creator before delete
- ✅ Matches frontend authorization logic
- ✅ Follows specification (with practical workflow adjustment)

## Recommendations

### 1. Field-Level Permissions (Future Enhancement)
Consider implementing fine-grained permissions:
```typescript
interface TaskUpdatePermissions {
  canChangeStatus: boolean;      // Assignee + Creator + Admin
  canChangeDescription: boolean; // Creator + Admin
  canChangeAssignee: boolean;    // Creator + Admin  
  canChangePriority: boolean;    // Creator + Admin
  canChangeDueDate: boolean;     // Creator + Admin
  canAddComments: boolean;       // Assignee + Creator + Admin
}
```

### 2. Update Specification
Document the clarification that:
> "Special Users can modify the status of tasks assigned to them, but cannot modify other task properties (description, assignee, priority, etc.). This allows them to mark tasks as in-progress and completed while maintaining security boundaries."

### 3. Audit Trail
Consider logging task status changes with:
- User who made the change
- Previous status → New status
- Timestamp
- Optional comment

## Files Modified

- ✅ `backend/src/presentation/controllers/task.controller.ts` - Added permission checks
- Documentation created

## Status

✅ **Ready for testing** - Do NOT commit yet until local testing confirms everything works correctly.
