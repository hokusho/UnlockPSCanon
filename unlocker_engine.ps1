param (
    [Parameter(Mandatory=$true)]
    [string]$InputPath,
    [Parameter(Mandatory=$true)]
    [string]$OutputPath
)

$ErrorActionPreference = "Stop"

$candidateDirs = @(
    "C:\Users\HOKUSHO\Documents\PSEditor_Unlocked",
    (Join-Path ([System.Environment]::GetFolderPath("MyDocuments")) "PSEditor_Unlocked"),
    "C:\Program Files\Canon\Picture Style Editor",
    "C:\Program Files (x86)\Canon\Picture Style Editor"
)

$appDir = $candidateDirs | Where-Object { Test-Path (Join-Path $_ "PSEditor.exe") } | Select-Object -First 1
if (-not $appDir) {
    Write-Error "Canon Picture Style Editor não foi encontrado."
    exit 1
}
$dppDir = Join-Path $appDir "DPP4Lib"

# Ensure PATH includes both directories
$currentPath = [System.Environment]::GetEnvironmentVariable("PATH", [System.EnvironmentVariableTarget]::Process)
if ($currentPath -notmatch [regex]::Escape($dppDir)) {
    [System.Environment]::SetEnvironmentVariable("PATH", "$appDir;$dppDir;$currentPath", [System.EnvironmentVariableTarget]::Process)
}

[System.IO.Directory]::SetCurrentDirectory($appDir)

$csharpCode = @"
using System;
using System.IO;
using System.Reflection;

public class ProfileUnlockerCore {
    private static bool initialized = false;
    private static Assembly pseAssembly;
    private static Type parserType;
    private static MethodInfo openMethod;
    private static MethodInfo save3Method;
    private static MethodInfo save2Method;
    private static FieldInfo idmField;
    private static Type idmType;
    private static PropertyInfo captionProp;
    private static PropertyInfo copyrightProp;

    public static void Init(string appDir) {
        if (initialized) return;
        string dppDir = Path.Combine(appDir, "DPP4Lib");
        string path = Environment.GetEnvironmentVariable("PATH");
        Environment.SetEnvironmentVariable("PATH", appDir + ";" + dppDir + ";" + path);
        Directory.SetCurrentDirectory(appDir);

        string exePath = Path.Combine(appDir, "PSEditor.exe");
        pseAssembly = Assembly.LoadFile(exePath);

        Type edsdkType = pseAssembly.GetType("PSE.EDSDK");
        edsdkType.GetMethod("EdsInitializeSDK").Invoke(null, null);

        Type cfparseType = pseAssembly.GetType("PSE.EdsCFParse");
        cfparseType.GetMethod("EdsCfpInitialize").Invoke(null, null);

        parserType = pseAssembly.GetType("PSE.PF2FileParser");
        openMethod = parserType.GetMethod("OpenPSFile", new Type[] { typeof(string) });
        save3Method = parserType.GetMethod("SavePS3File", new Type[] { typeof(string), typeof(string), typeof(string), typeof(int) });
        save2Method = parserType.GetMethod("SavePS2File", new Type[] { typeof(string), typeof(string), typeof(string), typeof(int) });

        idmField = parserType.GetField("imageDataModel", BindingFlags.NonPublic | BindingFlags.Instance);
        
        initialized = true;
    }

    public static string Unlock(string inputPath, string outputPath) {
        object parser = Activator.CreateInstance(parserType);
        object openRes = openMethod.Invoke(parser, new object[] { inputPath });
        long code = Convert.ToInt64(openRes);
        if (code != 0) {
            return "Falha ao abrir perfil: código " + code;
        }

        object idm = idmField.GetValue(parser);
        if (idmType == null) {
            idmType = idm.GetType();
            captionProp = idmType.GetProperty("PSCaption");
            copyrightProp = idmType.GetProperty("PSCopyRight");
        }

        string caption = (string)captionProp.GetValue(idm, null) ?? "";
        string copyright = (string)copyrightProp.GetValue(idm, null) ?? "";

        string ext = Path.GetExtension(inputPath).ToLower();
        object saveRes;
        if (ext == ".pf2") {
            saveRes = save2Method.Invoke(parser, new object[] { caption, copyright, outputPath, 0 });
        } else {
            saveRes = save3Method.Invoke(parser, new object[] { caption, copyright, outputPath, 0 });
        }

        bool success = Convert.ToBoolean(saveRes);
        if (!success) {
            return "Falha ao salvar perfil desbloqueado.";
        }
        return "OK";
    }
}
"@

if (-not ([System.Management.Automation.PSTypeName]'ProfileUnlockerCore').Type) {
    Add-Type -TypeDefinition $csharpCode
}

[ProfileUnlockerCore]::Init($appDir)
$result = [ProfileUnlockerCore]::Unlock($InputPath, $OutputPath)

if ($result -ne "OK") {
    Write-Error $result
    exit 1
}

Write-Output "SUCCESS"
