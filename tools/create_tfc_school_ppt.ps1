$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$OutFile = Join-Path $Root "TFC-School-Platform-Presentation.pptx"
$WorkDir = Join-Path $Root ".pptx-build"

if (Test-Path $WorkDir) {
  Remove-Item -LiteralPath $WorkDir -Recurse -Force
}
if (Test-Path $OutFile) {
  Remove-Item -LiteralPath $OutFile -Force
}

New-Item -ItemType Directory -Force -Path `
  $WorkDir, `
  (Join-Path $WorkDir "_rels"), `
  (Join-Path $WorkDir "docProps"), `
  (Join-Path $WorkDir "ppt"), `
  (Join-Path $WorkDir "ppt\_rels"), `
  (Join-Path $WorkDir "ppt\slides"), `
  (Join-Path $WorkDir "ppt\slides\_rels"), `
  (Join-Path $WorkDir "ppt\slideMasters"), `
  (Join-Path $WorkDir "ppt\slideMasters\_rels"), `
  (Join-Path $WorkDir "ppt\slideLayouts"), `
  (Join-Path $WorkDir "ppt\slideLayouts\_rels"), `
  (Join-Path $WorkDir "ppt\theme") | Out-Null

function Escape-Xml([string]$Value) {
  return [Security.SecurityElement]::Escape($Value)
}

function Emu([double]$Inches) {
  return [int64][Math]::Round($Inches * 914400)
}

function Write-Utf8File([string]$Path, [string]$Content) {
  $Encoding = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $Encoding)
}

function TextBoxXml(
  [int]$Id,
  [string]$Name,
  [double]$X,
  [double]$Y,
  [double]$W,
  [double]$H,
  [string[]]$Lines,
  [int]$Size = 24,
  [string]$Color = "0F172A",
  [bool]$Bold = $false,
  [string]$Align = "l",
  [bool]$Bullets = $false
) {
  $RunBold = if ($Bold) { ' b="1"' } else { "" }
  $Paragraphs = ""
  foreach ($Line in $Lines) {
    $BulletXml = ""
    if ($Bullets -and $Line.Trim().Length -gt 0) {
      $BulletXml = '<a:pPr marL="285750" indent="-171450"><a:buChar char="•"/></a:pPr>'
    } elseif ($Align -ne "l") {
      $BulletXml = "<a:pPr algn=`"$Align`"/>"
    }
    $Paragraphs += @"
<a:p>$BulletXml<a:r><a:rPr lang="en-US" sz="$($Size * 100)"$RunBold><a:solidFill><a:srgbClr val="$Color"/></a:solidFill></a:rPr><a:t>$(Escape-Xml $Line)</a:t></a:r></a:p>
"@
  }

  return @"
<p:sp>
  <p:nvSpPr><p:cNvPr id="$Id" name="$(Escape-Xml $Name)"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
  <p:spPr>
    <a:xfrm><a:off x="$(Emu $X)" y="$(Emu $Y)"/><a:ext cx="$(Emu $W)" cy="$(Emu $H)"/></a:xfrm>
    <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
    <a:noFill/><a:ln><a:noFill/></a:ln>
  </p:spPr>
  <p:txBody><a:bodyPr wrap="square" anchor="t"/><a:lstStyle/>$Paragraphs</p:txBody>
</p:sp>
"@
}

function RectXml(
  [int]$Id,
  [string]$Name,
  [double]$X,
  [double]$Y,
  [double]$W,
  [double]$H,
  [string]$Fill = "FFFFFF",
  [string]$Line = "CBD5E1",
  [double]$Radius = 0.03
) {
  return @"
<p:sp>
  <p:nvSpPr><p:cNvPr id="$Id" name="$(Escape-Xml $Name)"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
  <p:spPr>
    <a:xfrm><a:off x="$(Emu $X)" y="$(Emu $Y)"/><a:ext cx="$(Emu $W)" cy="$(Emu $H)"/></a:xfrm>
    <a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val $([int]($Radius * 100000))"/></a:avLst></a:prstGeom>
    <a:solidFill><a:srgbClr val="$Fill"/></a:solidFill>
    <a:ln w="9144"><a:solidFill><a:srgbClr val="$Line"/></a:solidFill></a:ln>
  </p:spPr>
</p:sp>
"@
}

function LineXml([int]$Id, [double]$X1, [double]$Y1, [double]$X2, [double]$Y2, [string]$Color = "0F766E") {
  $X = [Math]::Min($X1, $X2)
  $Y = [Math]::Min($Y1, $Y2)
  $W = [Math]::Abs($X2 - $X1)
  $H = [Math]::Abs($Y2 - $Y1)
  if ($W -eq 0) { $W = 0.001 }
  if ($H -eq 0) { $H = 0.001 }
  return @"
<p:cxnSp>
  <p:nvCxnSpPr><p:cNvPr id="$Id" name="Connector $Id"/><p:cNvCxnSpPr/><p:nvPr/></p:nvCxnSpPr>
  <p:spPr>
    <a:xfrm><a:off x="$(Emu $X)" y="$(Emu $Y)"/><a:ext cx="$(Emu $W)" cy="$(Emu $H)"/></a:xfrm>
    <a:prstGeom prst="line"><a:avLst/></a:prstGeom>
    <a:ln w="27432"><a:solidFill><a:srgbClr val="$Color"/></a:solidFill><a:tailEnd type="triangle"/></a:ln>
  </p:spPr>
</p:cxnSp>
"@
}

function SlideXml([string]$Title, [string]$Subtitle, [scriptblock]$BodyBuilder, [string]$Bg = "F8FAFC") {
  $Shapes = @()
  $Shapes += RectXml 2 "Top Accent" 0 0 13.333 0.12 "0F766E" "0F766E" 0
  $Shapes += TextBoxXml 3 "Slide Title" 0.55 0.35 8.7 0.55 @($Title) 25 "0F172A" $true
  if ($Subtitle) {
    $Shapes += TextBoxXml 4 "Slide Subtitle" 0.58 0.92 8.9 0.32 @($Subtitle) 10 "64748B" $false
  }
  $Shapes += TextBoxXml 5 "Footer" 10.25 6.95 2.6 0.25 @("TFC School | Algeria") 8 "64748B" $false "r"
  $Shapes += & $BodyBuilder
  $ShapeXml = $Shapes -join "`n"

  return @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg><p:bgPr><a:solidFill><a:srgbClr val="$Bg"/></a:solidFill></p:bgPr></p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      $ShapeXml
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>
"@
}

$slides = @()

$slides += SlideXml "TFC School Platform" "Private school management system for students, teachers, attendance, and communication" {
  @(
    RectXml 10 "Hero Card" 0.75 1.55 11.8 4.6 "FFFFFF" "E2E8F0" 0.02
    RectXml 11 "Logo Box" 1.15 1.95 2.25 2.25 "0F766E" "0F766E" 0.04
    TextBoxXml 12 "TFC Logo" 1.45 2.48 1.65 0.85 @("TFC") 38 "FFFFFF" $true "c"
    TextBoxXml 13 "Main Title" 3.75 2.0 7.8 0.85 @("A modern digital platform for TFC School") 31 "0F172A" $true
    TextBoxXml 14 "Main Subtitle" 3.78 2.95 7.5 0.9 @("Built to manage school users, daily attendance, reports, and parent communication from one secure website.") 17 "334155"
    TextBoxXml 15 "Live URL" 3.78 4.1 7.5 0.35 @("Live demo: https://tfc-school.onrender.com") 15 "0F766E" $true
    TextBoxXml 16 "Prepared" 3.78 4.7 7.5 0.35 @("Prepared for: TFC School Management") 13 "64748B"
  )
}

$slides += SlideXml "Project Goal" "Why the website was created" {
  @(
    RectXml 10 "Goal Card 1" 0.75 1.45 3.75 4.5 "FFFFFF" "D1FAE5" 0.02
    RectXml 11 "Goal Card 2" 4.75 1.45 3.75 4.5 "FFFFFF" "BAE6FD" 0.02
    RectXml 12 "Goal Card 3" 8.75 1.45 3.75 4.5 "FFFFFF" "FDE68A" 0.02
    TextBoxXml 13 "Goal 1" 1.05 1.9 3.1 0.5 @("Organize") 22 "0F766E" $true
    TextBoxXml 14 "Goal 1 Text" 1.05 2.65 3.0 2.1 @("Centralize students, teachers, profiles, contacts, and class information in one place.") 15 "334155"
    TextBoxXml 15 "Goal 2" 5.05 1.9 3.1 0.5 @("Track") 22 "0369A1" $true
    TextBoxXml 16 "Goal 2 Text" 5.05 2.65 3.0 2.1 @("Make daily attendance fast, clear, and easy for teachers and administrators.") 15 "334155"
    TextBoxXml 17 "Goal 3" 9.05 1.9 3.1 0.5 @("Communicate") 22 "92400E" $true
    TextBoxXml 18 "Goal 3 Text" 9.05 2.65 3.0 2.1 @("Prepare automatic absence notifications so parents can be informed quickly.") 15 "334155"
  )
}

$slides += SlideXml "User Roles" "Separate access points with clear permissions" {
  @(
    RectXml 10 "Admin Card" 0.75 1.35 2.8 4.9 "FFFFFF" "CBD5E1" 0.02
    RectXml 11 "Teacher Card" 3.85 1.35 2.8 4.9 "FFFFFF" "CBD5E1" 0.02
    RectXml 12 "Student Card" 6.95 1.35 2.8 4.9 "FFFFFF" "CBD5E1" 0.02
    RectXml 13 "Parent Card" 10.05 1.35 2.55 4.9 "FFFFFF" "CBD5E1" 0.02
    TextBoxXml 14 "Admin" 1.05 1.75 2.2 0.35 @("Admin") 20 "0F766E" $true
    TextBoxXml 15 "Admin Bullets" 1.05 2.35 2.1 2.6 @("Full dashboard access", "Create/edit/delete users", "View reports", "Monitor attendance") 12 "334155" $false "l" $true
    TextBoxXml 16 "Teacher" 4.15 1.75 2.2 0.35 @("Teacher") 20 "0369A1" $true
    TextBoxXml 17 "Teacher Bullets" 4.15 2.35 2.1 2.6 @("View assigned students", "Mark Present/Absent", "Add notes", "Trigger absence alert") 12 "334155" $false "l" $true
    TextBoxXml 18 "Student" 7.25 1.75 2.2 0.35 @("Student") 20 "7C3AED" $true
    TextBoxXml 19 "Student Bullets" 7.25 2.35 2.1 2.6 @("View own profile", "See attendance history", "Check course and mark", "Protected login") 12 "334155" $false "l" $true
    TextBoxXml 20 "Parent" 10.35 1.75 2.0 0.35 @("Parent") 20 "92400E" $true
    TextBoxXml 21 "Parent Bullets" 10.35 2.35 2.0 2.6 @("Receives absence message", "No full account needed", "Contact stored in profile") 12 "334155" $false "l" $true
  )
}

$slides += SlideXml "Admin Dashboard" "Management view for the school manager" {
  @(
    RectXml 10 "Stats" 0.75 1.35 11.8 1.3 "ECFDF5" "A7F3D0" 0.02
    TextBoxXml 11 "Stats Text" 1.05 1.72 10.9 0.45 @("Overview cards: total students, total teachers, present today, absent today") 20 "064E3B" $true
    RectXml 12 "Admin Left" 0.75 2.75 5.65 3.25 "FFFFFF" "CBD5E1" 0.02
    RectXml 13 "Admin Right" 6.75 2.75 5.8 3.25 "FFFFFF" "CBD5E1" 0.02
    TextBoxXml 14 "User Management" 1.05 3.1 4.8 0.35 @("User Management") 18 "0F766E" $true
    TextBoxXml 15 "User Bullets" 1.05 3.65 4.8 1.9 @("Create admin, teacher, and student accounts", "Edit profiles and parent contacts", "Assign students to teachers", "Delete inactive users safely") 13 "334155" $false "l" $true
    TextBoxXml 16 "Reports" 7.05 3.1 4.8 0.35 @("Reports and Monitoring") 18 "0369A1" $true
    TextBoxXml 17 "Report Bullets" 7.05 3.65 4.8 1.9 @("View attendance history", "Filter by date and status", "See recent absences", "Prepare school reports") 13 "334155" $false "l" $true
  )
}

$slides += SlideXml "Teacher Dashboard" "Fast daily attendance workflow" {
  @(
    RectXml 10 "Teacher Main" 0.75 1.35 7.1 5.25 "FFFFFF" "CBD5E1" 0.02
    RectXml 11 "Teacher Side" 8.15 1.35 4.4 5.25 "F0F9FF" "BAE6FD" 0.02
    TextBoxXml 12 "Teacher Flow" 1.05 1.75 6.5 0.4 @("Teacher workflow") 20 "0369A1" $true
    TextBoxXml 13 "Teacher Bullets" 1.05 2.35 6.3 2.6 @("Logs in from /teacher/login", "Sees only assigned students", "Marks Present or Absent in one click", "Adds optional notes for context", "Absent records prepare parent notification status") 14 "334155" $false "l" $true
    TextBoxXml 14 "Side Title" 8.5 1.85 3.6 0.4 @("Designed for speed") 20 "075985" $true
    TextBoxXml 15 "Side Text" 8.5 2.55 3.5 2.1 @("The teacher screen is simple on purpose: student list, note field, and two clear buttons for attendance.") 15 "334155"
    TextBoxXml 16 "Teacher URL" 8.5 4.75 3.5 0.35 @("/teacher/login") 15 "0F766E" $true
  )
}

$slides += SlideXml "Student Dashboard" "Simple self-service profile view" {
  @(
    RectXml 10 "Profile Card" 0.75 1.35 5.7 5.2 "FFFFFF" "CBD5E1" 0.02
    RectXml 11 "History Card" 6.8 1.35 5.75 5.2 "FFFFFF" "CBD5E1" 0.02
    TextBoxXml 12 "Profile" 1.05 1.75 4.8 0.35 @("Student Profile") 19 "7C3AED" $true
    TextBoxXml 13 "Profile Bullets" 1.05 2.35 4.9 2.9 @("Full name", "Age", "Course or field of study", "Parent phone/email", "Optional mark field", "Assigned teacher") 14 "334155" $false "l" $true
    TextBoxXml 14 "History" 7.1 1.75 4.8 0.35 @("Attendance History") 19 "0F766E" $true
    TextBoxXml 15 "History Bullets" 7.1 2.35 4.9 2.2 @("Recent attendance records", "Present/Absent status", "Teacher name", "Optional notes") 14 "334155" $false "l" $true
    TextBoxXml 16 "Student URL" 7.1 5.25 4.6 0.35 @("/student/login") 15 "0F766E" $true
  )
}

$slides += SlideXml "Attendance System" "Daily attendance with absence communication" {
  @(
    RectXml 10 "Step1" 0.7 2.0 2.25 1.1 "ECFDF5" "A7F3D0" 0.02
    RectXml 11 "Step2" 3.35 2.0 2.25 1.1 "EFF6FF" "BAE6FD" 0.02
    RectXml 12 "Step3" 6.0 2.0 2.25 1.1 "FEF3C7" "FDE68A" 0.02
    RectXml 13 "Step4" 8.65 2.0 2.25 1.1 "FDF2F8" "FBCFE8" 0.02
    RectXml 14 "Step5" 11.0 2.0 1.85 1.1 "F8FAFC" "CBD5E1" 0.02
    LineXml 15 2.95 2.55 3.35 2.55
    LineXml 16 5.6 2.55 6.0 2.55
    LineXml 17 8.25 2.55 8.65 2.55
    LineXml 18 10.9 2.55 11.0 2.55
    TextBoxXml 19 "S1" 0.9 2.27 1.8 0.35 @("Teacher marks") 13 "064E3B" $true "c"
    TextBoxXml 20 "S2" 3.55 2.27 1.8 0.35 @("API saves") 13 "075985" $true "c"
    TextBoxXml 21 "S3" 6.15 2.27 1.9 0.35 @("Parent alert") 13 "92400E" $true "c"
    TextBoxXml 22 "S4" 8.85 2.27 1.8 0.35 @("Reports update") 13 "9D174D" $true "c"
    TextBoxXml 23 "S5" 11.15 2.27 1.5 0.35 @("History") 13 "334155" $true "c"
    TextBoxXml 24 "Details" 1.0 4.1 11.0 1.0 @("If a student is marked Absent, the system stores the absence, keeps notification status, and can send an email to the parent when SMTP is configured.") 18 "334155"
  )
}

$slides += SlideXml "Technical Architecture" "How the website is built" {
  @(
    RectXml 10 "Frontend" 0.75 1.6 3.2 3.8 "FFFFFF" "BAE6FD" 0.02
    RectXml 11 "Backend" 4.65 1.6 3.2 3.8 "FFFFFF" "A7F3D0" 0.02
    RectXml 12 "Data" 8.55 1.6 3.8 3.8 "FFFFFF" "FDE68A" 0.02
    LineXml 13 3.95 3.5 4.65 3.5 "0F766E"
    LineXml 14 7.85 3.5 8.55 3.5 "0F766E"
    TextBoxXml 15 "Frontend Title" 1.05 2.0 2.7 0.35 @("Frontend") 19 "0369A1" $true "c"
    TextBoxXml 16 "Frontend Bullets" 1.05 2.65 2.7 1.55 @("React", "Vite", "Tailwind CSS", "Role dashboards") 13 "334155" $false "l" $true
    TextBoxXml 17 "Backend Title" 4.95 2.0 2.7 0.35 @("Backend") 19 "0F766E" $true "c"
    TextBoxXml 18 "Backend Bullets" 4.95 2.65 2.7 1.55 @("Node.js", "Express", "JWT auth", "Validation") 13 "334155" $false "l" $true
    TextBoxXml 19 "Data Title" 8.85 2.0 3.1 0.35 @("Data and Services") 19 "92400E" $true "c"
    TextBoxXml 20 "Data Bullets" 8.85 2.65 3.1 1.9 @("MongoDB Atlas", "Mongoose models", "SMTP email", "Render hosting") 13 "334155" $false "l" $true
  )
}

$slides += SlideXml "Security" "Built with practical protections for a small school" {
  @(
    RectXml 10 "Security Card" 0.75 1.35 11.8 5.35 "FFFFFF" "CBD5E1" 0.02
    TextBoxXml 11 "Security Bullets" 1.1 1.85 10.8 3.5 @("JWT-based authentication for secure sessions", "Role-based access control for admin, teacher, and student routes", "Passwords are hashed with bcrypt", "Input validation is handled before saving data", "Environment variables protect secrets like database URLs and JWT keys", "Production deployment uses HTTPS through Render") 16 "334155" $false "l" $true
    TextBoxXml 12 "Important" 1.1 5.35 10.7 0.45 @("Important before real launch: replace demo accounts, use strong manager passwords, and keep MongoDB credentials private.") 15 "BE123C" $true
  )
}

$slides += SlideXml "Live Deployment" "Current online status and routes" {
  @(
    RectXml 10 "Live Card" 0.75 1.35 11.8 2.0 "ECFDF5" "A7F3D0" 0.02
    TextBoxXml 11 "Live URL" 1.05 1.85 10.9 0.45 @("Live website: https://tfc-school.onrender.com") 20 "064E3B" $true
    TextBoxXml 12 "Live Text" 1.05 2.55 10.6 0.4 @("Hosted as a Render web service. The Express backend serves the built React app and API from one URL.") 14 "334155"
    RectXml 13 "Routes" 0.75 3.75 11.8 2.0 "FFFFFF" "CBD5E1" 0.02
    TextBoxXml 14 "Route List" 1.05 4.15 10.8 1.0 @("/admin/login - manager access", "/teacher/login - teacher attendance access", "/student/login - student profile access") 16 "334155" $false "l" $true
  )
}

$slides += SlideXml "Demo Accounts" "Accounts currently available for testing" {
  @(
    RectXml 10 "Table" 0.75 1.45 11.8 4.8 "FFFFFF" "CBD5E1" 0.02
    TextBoxXml 11 "Header" 1.05 1.8 10.8 0.35 @("Role                         Email                                      Password") 15 "0F172A" $true
    TextBoxXml 12 "Rows" 1.05 2.45 10.8 2.15 @("Admin                       admin@tfcschool.dz               Admin@12345", "Teacher                    teacher.english@tfcschool.dz    Teacher@12345", "Student                    student.amine@tfcschool.dz       Student@12345") 15 "334155"
    TextBoxXml 13 "Warning" 1.05 5.35 10.6 0.35 @("For real use, create new accounts and change default passwords before giving access.") 14 "BE123C" $true
  )
}

$slides += SlideXml "Next Steps" "What remains before official real use" {
  @(
    RectXml 10 "Next" 0.75 1.35 11.8 5.3 "FFFFFF" "CBD5E1" 0.02
    TextBoxXml 11 "Next Bullets" 1.1 1.85 10.8 3.65 @("Connect MongoDB Atlas permanently and turn DEMO_MODE=false", "Upload the real TFC School logo", "Create real manager, teacher, and student accounts", "Configure SMTP email for absence notifications", "Review data privacy and backup process", "Train the manager and teachers on daily attendance workflow") 16 "334155" $false "l" $true
    TextBoxXml 12 "Close" 1.1 5.55 10.8 0.35 @("The platform is ready as a working live demo and can be moved into real operation after the database and accounts are finalized.") 14 "0F766E" $true
  )
}

for ($i = 0; $i -lt $slides.Count; $i++) {
  Write-Utf8File (Join-Path $WorkDir "ppt\slides\slide$($i + 1).xml") $slides[$i]
  Write-Utf8File (Join-Path $WorkDir "ppt\slides\_rels\slide$($i + 1).xml.rels") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>
"@
}

$SlideContentTypes = ""
$SlideIds = ""
$SlideRels = ""
for ($i = 1; $i -le $slides.Count; $i++) {
  $SlideContentTypes += "<Override PartName=`"/ppt/slides/slide$i.xml`" ContentType=`"application/vnd.openxmlformats-officedocument.presentationml.slide+xml`"/>`n"
  $SlideIds += "<p:sldId id=`"$([int](255 + $i))`" r:id=`"rId$([int](10 + $i))`"/>`n"
  $SlideRels += "<Relationship Id=`"rId$([int](10 + $i))`" Type=`"http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide`" Target=`"slides/slide$i.xml`"/>`n"
}

Write-Utf8File (Join-Path $WorkDir "[Content_Types].xml") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  $SlideContentTypes
</Types>
"@

Write-Utf8File (Join-Path $WorkDir "_rels\.rels") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
"@

Write-Utf8File (Join-Path $WorkDir "docProps\core.xml") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>TFC School Platform Presentation</dc:title>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-06-03T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-06-03T00:00:00Z</dcterms:modified>
</cp:coreProperties>
"@

Write-Utf8File (Join-Path $WorkDir "docProps\app.xml") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft PowerPoint</Application>
  <PresentationFormat>On-screen Show (16:9)</PresentationFormat>
  <Slides>$($slides.Count)</Slides>
  <Company>TFC School</Company>
</Properties>
"@

Write-Utf8File (Join-Path $WorkDir "ppt\presentation.xml") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>
  <p:sldIdLst>
    $SlideIds
  </p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000" type="wide"/>
  <p:notesSz cx="6858000" cy="9144000"/>
  <p:defaultTextStyle>
    <a:defPPr><a:defRPr lang="en-US"/></a:defPPr>
  </p:defaultTextStyle>
</p:presentation>
"@

Write-Utf8File (Join-Path $WorkDir "ppt\_rels\presentation.xml.rels") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>
  $SlideRels
</Relationships>
"@

Write-Utf8File (Join-Path $WorkDir "ppt\slideMasters\slideMaster1.xml") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
  <p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles>
</p:sldMaster>
"@

Write-Utf8File (Join-Path $WorkDir "ppt\slideMasters\_rels\slideMaster1.xml.rels") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>
"@

Write-Utf8File (Join-Path $WorkDir "ppt\slideLayouts\slideLayout1.xml") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">
  <p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>
"@

Write-Utf8File (Join-Path $WorkDir "ppt\slideLayouts\_rels\slideLayout1.xml.rels") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>
"@

Write-Utf8File (Join-Path $WorkDir "ppt\theme\theme1.xml") @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="TFC School">
  <a:themeElements>
    <a:clrScheme name="TFC School">
      <a:dk1><a:srgbClr val="0F172A"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>
      <a:dk2><a:srgbClr val="334155"/></a:dk2><a:lt2><a:srgbClr val="F8FAFC"/></a:lt2>
      <a:accent1><a:srgbClr val="0F766E"/></a:accent1><a:accent2><a:srgbClr val="0369A1"/></a:accent2>
      <a:accent3><a:srgbClr val="7C3AED"/></a:accent3><a:accent4><a:srgbClr val="D97706"/></a:accent4>
      <a:accent5><a:srgbClr val="BE123C"/></a:accent5><a:accent6><a:srgbClr val="64748B"/></a:accent6>
      <a:hlink><a:srgbClr val="2563EB"/></a:hlink><a:folHlink><a:srgbClr val="7C3AED"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="TFC School"><a:majorFont><a:latin typeface="Aptos Display"/></a:majorFont><a:minorFont><a:latin typeface="Aptos"/></a:minorFont></a:fontScheme>
    <a:fmtScheme name="TFC School"><a:fillStyleLst/><a:lnStyleLst/><a:effectStyleLst/><a:bgFillStyleLst/></a:fmtScheme>
  </a:themeElements>
</a:theme>
"@

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$Archive = [System.IO.Compression.ZipFile]::Open($OutFile, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  Get-ChildItem -Path $WorkDir -Recurse -File | ForEach-Object {
    $Relative = $_.FullName.Substring($WorkDir.Length + 1).Replace("\", "/")
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($Archive, $_.FullName, $Relative, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
}
finally {
  $Archive.Dispose()
}

Remove-Item -LiteralPath $WorkDir -Recurse -Force
Write-Output $OutFile
