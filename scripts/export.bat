xcopy "%1..\..\Apps\TicTacToeOnline\TicTacToeOnline\Client" "%1TicTacToeOnline\Client" /Y /I /S
xcopy "%1..\..\Apps\TicTacToeOnline\TicTacToeOnline\Server" "%1TicTacToeOnline\Server" /Y /I /S
xcopy "%1..\..\Apps\TicTacToeOnline\Lib\Client" "%1Lib\Client" /Y /I /S /EXCLUDE:%2
