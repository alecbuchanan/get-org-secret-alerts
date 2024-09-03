// getOrgSecretAlerts.js
import 'dotenv/config';
import { Octokit } from "octokit";
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';

// Initialize Octokit with authentication
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

// Initialize CSV writer
const csvWriter = createCsvWriter({
  path: 'output.csv',
  header: [
    { id: 'secret_type', title: 'SECRET_TYPE' },
    { id: 'location_type', title: 'LOCATION_TYPE' },
    { id: 'path', title: 'PATH' },
    { id: 'url', title: 'URL' }
  ]
});

/**
 * Extracts repository information from a commit URL.
 * @param {string} commitUrl - The commit URL.
 * @returns {Object} An object containing orgName and repoName.
 */
const extractRepoInfoFromCommitUrl = (commitUrl) => {
  const urlParts = commitUrl.split('/');
  return {
    orgName: urlParts[4],
    repoName: urlParts[5]
  };
};

/**
 * Fetches and processes organization secret alerts.
 */
async function getOrgSecretAlerts() {
  try {
    const alerts = await octokit.paginate('GET /orgs/{org}/secret-scanning/alerts', {
      org: process.env.GITHUB_ORG,
      per_page: 100,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    console.log(`Found ${alerts.length} alerts`);
    const records = [];
    let counter = 1; // Initialize counter

    for (const alert of alerts) {
      if (!alert.locations_url) {
        console.log(`Alert ${alert.number} is missing locations_url`);
        continue;
      }

      console.log(`Processing alert ${alert.number}`);
      let locationResponse;
      try {
        locationResponse = await octokit.request(`GET ${alert.locations_url}`, {
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });
      } catch (error) {
        console.error(`Failed to fetch locations for alert ${alert.number}:`, error);
        continue;
      }

      console.log(`Location Response: ${JSON.stringify(locationResponse, null, 2)}`);

      locationResponse.data.forEach(location => {
        let url;
        let path;

        if (location.details.path) {
          const commitUrl = location.details.commit_url || location.details.page_url;
          const { orgName, repoName } = extractRepoInfoFromCommitUrl(commitUrl);
          url = `https://github.com/${orgName}/${repoName}/commit/${location.details.commit_sha}`;
          path = `${repoName}/${location.details.path}`;
        } else {
          let commitUrl;
          let orgName;
          let repoName;

          switch (location.type) {
            case 'commit':
            case 'wiki_commit':
              // No URL or path assignment needed
              break;
            case 'issue_title':
              commitUrl = location.details.issue_title_url;
              ({ orgName, repoName } = extractRepoInfoFromCommitUrl(commitUrl));
              path = `${orgName}/${repoName}`;
              break;
            case 'issue_body':
              commitUrl = location.details.issue_body_url;
              ({ orgName, repoName } = extractRepoInfoFromCommitUrl(commitUrl));
              path = `${orgName}/${repoName}`;
              break;
            case 'issue_comment':
              commitUrl = location.details.issue_comment_url;
              ({ orgName, repoName } = extractRepoInfoFromCommitUrl(commitUrl));
              path = `${orgName}/${repoName}`;
              break;
            case 'pull_request_title':
              commitUrl = location.details.pull_request_title_url;
              ({ orgName, repoName } = extractRepoInfoFromCommitUrl(commitUrl));
              path = `${orgName}/${repoName}`;
              break;
            case 'pull_request_body':
              commitUrl = location.details.pull_request_body_url;
              ({ orgName, repoName } = extractRepoInfoFromCommitUrl(commitUrl));
              path = `${orgName}/${repoName}`;
              break;
            case 'pull_request_comment':
              commitUrl = location.details.pull_request_comment_url;
              ({ orgName, repoName } = extractRepoInfoFromCommitUrl(commitUrl));
              path = `${orgName}/${repoName}`;
              break;
            case 'pull_request_review':
              commitUrl = location.details.pull_request_review_url;
              ({ orgName, repoName } = extractRepoInfoFromCommitUrl(commitUrl));
              path = `${orgName}/${repoName}`;
              break;
            case 'pull_request_review_comment':
              commitUrl = location.details.pull_request_review_comment_url;
              ({ orgName, repoName } = extractRepoInfoFromCommitUrl(commitUrl));
              path = `${orgName}/${repoName}`;
              break;
            default:
              console.log(`Unknown type: ${location.type}`);
              return;
          }
        }

        records.push({
          secret_type: `${alert.secret_type}_${counter}`, // Append counter to secret_type
          location_type: location.type, // Add location type
          path: path, // Add path
          url: url // Add URL
        });
      });
      counter++; // Increment counter for each alert object
    }

    await csvWriter.writeRecords(records);
    console.log('CSV file written successfully');
  } catch (error) {
    console.error('Failed to fetch organization secret alerts:', error);
  }
}

getOrgSecretAlerts();