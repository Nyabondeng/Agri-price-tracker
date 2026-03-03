# Main Branch Protection Checklist

GitHub path:
Settings -> Branches -> Branch protection rules -> Add rule

Target branch:
- `main`

Enable these required settings:
- Require a pull request before merging
- Require approvals: 1
- Dismiss stale pull request approvals when new commits are pushed
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Require conversation resolution before merging
- Include administrators

Repository settings to verify:
- Issues enabled
- Projects enabled

Evidence for submission:
- Screenshot of branch protection rule summary
- Screenshot of GitHub Project board with Backlog, In Progress, Done columns
