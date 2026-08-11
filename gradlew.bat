@rem
@rem Copyright 2015 the original author or authors.
@rem
@rem Licensed under the Apache License, Version 2.0 (the "License");
@rem you may not use this file except in compliance with the License.
@rem you may not use this file except in compliance with the License.
@rem You may obtain a copy of the License at
@rem
@rem      https://www.apache.org/licenses/LICENSE-2.0
@rem
@rem Unless required by applicable law or agreed to in writing, software
@rem distributed under the License is distributed on an "AS IS" BASIS,
@rem WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
@rem See the License for the specific language governing permissions and
@rem limitations under the License.
@rem

@if "%DEBUG%" == "" @echo off
@if "%JAVA_HOME%" == "" set JAVA_EXE=java
@if not "%JAVA_HOME%" == "" set JAVA_EXE=%JAVA_HOME%\bin\java

set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%

set WRAPPER_JAR="%APP_HOME%gradle\wrapper\gradle-wrapper.jar"
if exist %WRAPPER_JAR% (
    "%JAVA_EXE%" -classpath %WRAPPER_JAR% org.gradle.wrapper.GradleWrapperMain %*
) else (
    gradle %*
)
