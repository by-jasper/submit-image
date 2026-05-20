const RESPONSE_SHEET_NAME = "Sheet1";
// Change if your sheet tab name is different.

const TEAM_HEADER = "Team";
// Must match your Google Sheet team column header exactly.

const PHOTO_HEADER = "Upload your image here";
// Must match your Google Sheet upload/photo column header exactly.

function doGet(e) {
  if (isResetAction(e)) {
    return resetPhotoColumn();
  }

  return getLatestTeamPhotos();
}

function doPost(e) {
  if (isResetAction(e)) {
    return resetPhotoColumn();
  }

  return jsonOutput({
    success: false,
    message: "Unsupported action. Use action=reset to clear all response rows."
  });
}

function isResetAction(e) {
  const paramAction = e && e.parameter && e.parameter.action;

  if (String(paramAction || "").trim().toLowerCase() === "reset") {
    return true;
  }

  const body = e && e.postData && e.postData.contents;

  if (!body) {
    return false;
  }

  const rawBody = String(body).trim();

  if (!rawBody) {
    return false;
  }

  if (rawBody === "action=reset") {
    return true;
  }

  try {
    const parsed = JSON.parse(rawBody);
    return String(parsed && parsed.action || "").trim().toLowerCase() === "reset";
  } catch (error) {
    return false;
  }
}

function getLatestTeamPhotos() {
  const sheet = getResponseSheet();
  const data = sheet.getDataRange().getValues();

  if (data.length < 2) {
    return jsonOutput(getEmptyTeams());
  }

  const headers = data[0];
  const teamCol = headers.indexOf(TEAM_HEADER);
  const photoCol = headers.indexOf(PHOTO_HEADER);

  if (teamCol === -1) {
    throw new Error(`Team header not found: ${TEAM_HEADER}`);
  }

  if (photoCol === -1) {
    throw new Error(`Photo header not found: ${PHOTO_HEADER}`);
  }

  const latestMap = {};

  for (let i = 1; i < data.length; i++) {
    const team = data[i][teamCol];
    const photo = data[i][photoCol];

    if (team && photo) {
      latestMap[String(team).trim()] = String(photo).trim();
      // Latest row will overwrite earlier photo.
    }
  }

  const result = getEmptyTeams().map(item => ({
    team: item.team,
    photo: latestMap[item.team] || ""
  }));

  return jsonOutput(result);
}

function resetPhotoColumn() {
  const sheet = getResponseSheet();
  const data = sheet.getDataRange().getValues();

  if (data.length < 2) {
    return jsonOutput({ success: true, message: "No response rows to reset.", clearedRows: 0 });
  }

  const firstDataRow = 2;
  const numRows = data.length - 1;

  sheet.deleteRows(firstDataRow, numRows);

  return jsonOutput({
    success: true,
    message: "All response rows deleted successfully.",
    clearedRows: numRows
  });
}

function getResponseSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(RESPONSE_SHEET_NAME);

  if (!sheet) {
    throw new Error(`Sheet not found: ${RESPONSE_SHEET_NAME}`);
  }

  return sheet;
}

function jsonOutput(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function getEmptyTeams() {
  return [
    { team: "Team 1", photo: "" },
    { team: "Team 2", photo: "" },
    { team: "Team 3", photo: "" },
    { team: "Team 4", photo: "" },
    { team: "Team 5", photo: "" },
    { team: "Team 6", photo: "" },
    { team: "Team 7", photo: "" },
    { team: "Team 8", photo: "" }
  ];
}
