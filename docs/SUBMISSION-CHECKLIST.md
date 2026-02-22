# F1 Submission Final Checklist

## Part 1: Push Recent Changes (5 minutes)

```bash
cd "c:\Users\LENOVO\OneDrive\Desktop\All projects\farm-tracker\Agri-price-tracker"
git add CONTRIBUTING.md
git commit -m "docs: add contribution guidelines for team workflow"
git push origin main
```

## Part 2: GitHub Project Board (15 minutes)

1. Go to https://github.com/Nyabondeng/Agri-price-tracker
2. Click "Projects" tab
3. Click "New project" button
4. Choose "Board" template
5. Name it "F1 Development Board"
6. Add 10 items from `docs/github-project-backlog.md`:
   - Copy each item title and description
   - Click "+ Add item" in Backlog column
   - Paste content
7. Move completed items to "Done" column:
   - Item 1 (View prices feature) → Done
   - Item 2 (JSON API endpoint) → Done
8. Take screenshot of the board

## Part 3: Branch Protection Rules (10 minutes)

1. Go to Settings → Branches
2. Click "Add rule"
3. Branch name pattern: `main`
4. Check these boxes:
   - ✓ Require a pull request before merging
   - ✓ Require approvals (set to 1)
   - ✓ Dismiss stale pull request approvals when new commits are pushed
   - ✓ Require status checks to pass before merging
   - ✓ Require branches to be up to date before merging
   - ✓ Require conversation resolution before merging
   - ✓ Include administrators
5. Click "Create"
6. Take screenshot

## Part 4: Update CODEOWNERS (5 minutes)

1. Get GitHub usernames from your team
2. Edit `.github/CODEOWNERS` file
3. Replace `@replace-with-username` with actual usernames
4. Example: `* @nyabondeng @christelle-gh @agns-berko`
5. Commit and push

## Part 5: Canvas Submission (5 minutes)

Submit these details:

**Repository URL:**
https://github.com/Nyabondeng/Agri-price-tracker

**Team Members:**
- Agns Adepa Berko - Team Lead and DevOps Coordinator
- Christelle Usanase - Documentation Lead
- Nyabon Deng Adut - Backend Developer

**Attachments:**
- Screenshot: GitHub Project board
- Screenshot: Branch protection rules

## Completed Work Summary

Done:
- ✓ Project ideation with Ghana context
- ✓ README with problem statement, users, features
- ✓ Initial Node.js app with price API and web view
- ✓ Secure repo files (.gitignore, LICENSE, CODEOWNERS)
- ✓ Documentation (README, CONTRIBUTING, API docs)
- ✓ 6+ meaningful commits from multiple team members
- ✓ Backlog prepared (10 items)

Remaining (30 minutes total):
- Create GitHub Project board
- Enable branch protection
- Update CODEOWNERS with real usernames
- Take screenshots
- Submit on Canvas
