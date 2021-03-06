<?php

use DenisBeliaev\logAnalyzer\Parser;

class YiiLogParserTest extends PHPUnit_Framework_TestCase
{
    /**
     * @covers \DenisBeliaev\logAnalyzer\YiiLogParser::__construct
     * @expectedException \RuntimeException
     */
    public function testCannotBeConstructedFromNonExistingFilename()
    {
        new Parser('noExist.file');
    }

    /**
     * @covers \DenisBeliaev\logAnalyzer\Parser::isUpdated
     * @expectedException \InvalidArgumentException
     */
    public function testCannotBeCheckedForUpdateFromFloat()
    {
        $log = new Parser(__DIR__ . '/test.yii.log');
        $log->isUpdated(12.3);
    }

    /**
     * @covers \DenisBeliaev\logAnalyzer\Parser::isUpdated
     * @expectedException \InvalidArgumentException
     */
    public function testCannotBeCheckedForUpdateFromString()
    {
        $log = new Parser(__DIR__ . '/test.yii.log');
        $log->isUpdated('string');
    }

    /**
     * @covers \DenisBeliaev\logAnalyzer\Parser::isUpdated
     */
    public function testUpdatedWeather()
    {
        $filePath = __DIR__ . '/test.yii.log';
        touch($filePath, 1437941295);
        $log = new Parser($filePath);
        $this->assertEquals(false, $log->isUpdated(time()));
        $this->assertEquals(true, $log->isUpdated(1));
        $this->assertEquals(1437941295, $log->lastModified);
    }

    /**
     * @covers \DenisBeliaev\logAnalyzer\Parser::isUpdated
     * @expectedException \UnexpectedValueException
     */
    public function testForParseWrongFormat()
    {
        $tf = tmpfile();
        fwrite($tf, "wrong format");
        $filename = stream_get_meta_data($tf)['uri'];
        $log = new Parser($filename);
        $log->parse();
    }

    /**
     * @covers \DenisBeliaev\logAnalyzer\Parser::isUpdated
     */
    public function testForParseEmpty()
    {
        $filename = __DIR__ . '/empty.log';
        file_put_contents($filename, '');
        $log = new Parser($filename);
        $parsedLog = $log->parse();
        unlink($filename);
        $this->assertInternalType('array', $parsedLog);
        $this->assertCount(0, $parsedLog);
    }

    /**
     * @covers \DenisBeliaev\logAnalyzer\Parser::isUpdated
     */
    public function testForParse()
    {
        // Yii log
        $log = new Parser(__DIR__ . '/test.yii.log');
        $parsedLog = $log->parse();
        $this->assertInternalType('array', $parsedLog);
        $this->assertCount(14, $parsedLog);

        // Nginx log
        $log = new Parser(__DIR__ . '/test.nginx.log');
        $parsedLog = $log->parse();
        $this->assertInternalType('array', $parsedLog);
        $this->assertCount(122, $parsedLog);
    }
}