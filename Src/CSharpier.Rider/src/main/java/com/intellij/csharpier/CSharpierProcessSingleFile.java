package com.intellij.csharpier;

import com.esotericsoftware.minlog.Log;
import com.intellij.openapi.diagnostic.Logger;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;

public class CSharpierProcessSingleFile implements ICSharpierProcess {
    Logger logger = CSharpierLogger.getInstance();
    String csharpierPath;

    public CSharpierProcessSingleFile(String csharpierPath) {
        this.csharpierPath = csharpierPath;
    }

    @Override
    public String formatFile(String content, String fileName) {
        try {
            this.logger.debug("Running " + this.csharpierPath + " --write-stdout");
            ProcessBuilder processBuilder = new ProcessBuilder(this.csharpierPath, "--write-stdout");
            processBuilder.environment().put("DOTNET_NOLOGO", "1");
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();

            OutputStream stdin = process.getOutputStream();
            BufferedReader stdOut = new BufferedReader(new InputStreamReader(process.getInputStream()));

            stdin.write(content.getBytes());
            stdin.close();

            StringBuilder output = new StringBuilder();

            var nextCharacter = stdOut.read();
            while (nextCharacter != -1) {
                output.append((char)nextCharacter);
                nextCharacter = stdOut.read();
            }

            String result = output.toString();

            if (process.exitValue() == 0 && !result.contains("Failed to compile so was not formatted.")) {
                return result;
            }
            else {
                Log.error(result);
            }
        } catch (Exception e) {
            this.logger.error("error", e);
        }

        return "";
    }

    @Override
    public void dispose() {

    }
}
