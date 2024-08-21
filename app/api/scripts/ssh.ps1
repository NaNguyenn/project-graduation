param(
    [string]$AccountName
)

if (-not $AccountName) {
    Write-Host "Please provide an account name."
    exit 1
}

# Create a local user account with the given account name
New-LocalUser -Name $AccountName -NoPassword -Description "Local user created by PowerShell script" -FullName $AccountName

# Add the user to the 'Administrators' group to grant administrative privileges
Add-LocalGroupMember -Group "Administrators" -Member $AccountName

Write-Host "User $AccountName has been created and added to the Administrators group."
