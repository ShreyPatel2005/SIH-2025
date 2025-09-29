# Script to update CSV files with system column values

# Function to update a CSV file with system value
function Update-CsvWithSystem {
    param (
        [string]$filePath,
        [string]$systemName
    )
    
    Write-Host "Updating $filePath with system: $systemName"
    
    # Read the CSV file
    $content = Get-Content $filePath -Raw
    $lines = $content -split "`r?`n"
    
    # Process each line
    $newLines = @()
    foreach ($line in $lines) {
        # Skip empty lines
        if ([string]::IsNullOrWhiteSpace($line)) {
            $newLines += $line
            continue
        }
        
        # Check if it's the header line (already updated)
        if ($line -match '^term,code,description,category,system$') {
            $newLines += $line
            continue
        }
        
        # Check if the line already has the system value
        if ($line -match ",$systemName$") {
            $newLines += $line
            continue
        }
        
        # Add the system value to the line
        $newLines += "$line,$systemName"
    }
    
    # Write the updated content back to the file
    $newLines -join "`n" | Set-Content $filePath -NoNewline
    
    Write-Host "Updated $filePath successfully"
}

# Update the CSV files
Update-CsvWithSystem -filePath "sample-data\namaste-terminology.csv" -systemName "NAMASTE"
Update-CsvWithSystem -filePath "sample-data\icd11-biomedicine.csv" -systemName "ICD-11 BIOMEDICINE"
Update-CsvWithSystem -filePath "sample-data\who-ayurveda.csv" -systemName "WHO AYURVEDA"

Write-Host "All CSV files updated successfully"