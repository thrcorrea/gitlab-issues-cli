const axios = require('axios');

function makeGitlabApi(baseURL, token) {

  const instance = axios.create({
    baseURL,
    headers: { 'PRIVATE-TOKEN': token }
  });

  function listGroups() {
    return instance.get('api/v4/groups?per_page=100')
      .then((result) => {
        return result.data.map((group) => {
          return { id: group.id, name: group.name };
        })
      });
  };

  function listProjects(groupId) {
    return instance.get(`api/v4/groups/${groupId}`)
      .then((result) => result.data);
  }

  function listIssues(groupId, page = 1, data = []) {
    return instance.get(`api/v4/groups/${groupId}/issues?scope=all&per_page=2&page=${page}`)
      .then((result) => {
        const totalPages = result.headers['x-total-pages'];
        const currentPage = result.headers['x-page'];
        if (page < totalPages) {
          return listIssues(groupId, page + 1, data.concat(result.data));
        }
        return data.concat(result.data);
      });
  }

  return {
    listGroups,
    listIssues,
    listProjects,
  }
}

function listGroups(url, token) {
  axios.get(`${url}/api/v4/groups?per_page=100`)
}

module.exports = { makeGitlabApi }
