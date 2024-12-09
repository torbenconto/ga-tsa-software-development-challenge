import '@testing-library/jest-dom'
import {RSSItem, RSSParser} from '../../rss-parser/rss';
import axios from 'axios';
import {parseStringPromise} from 'xml2js';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('xml2js', () => ({
    parseStringPromise: jest.fn(),
}));

describe('RSSParser', () => {
    const mockUrl = 'http://example.com/rss';
    let parser: RSSParser;

    beforeEach(() => {
        parser = new RSSParser(mockUrl);
    });

    it('should parse feed data successfully', async () => {
        const mockXmlData = `
            <rss>
                <channel>
                    <item>
                        <title>Example Title</title>
                        <link>http://example.com</link>
                        <description>This is an example description.</description>
                        <source url="http://source.com">Example Source</source>
                        <pubDate>Wed, 01 Jan 2020 00:00:00 GMT</pubDate>
                    </item>
                </channel>
            </rss>
        `;
        const mockJsonData = {
            rss: {
                channel: [{
                    item: [{
                        title: ['Example Title'],
                        link: ['http://example.com'],
                        description: ['This is an example description.'],
                        source: [{
                            _: 'Example Source',
                            $: {url: 'http://source.com'}
                        }],
                        pubDate: ['Wed, 01 Jan 2020 00:00:00 GMT'],
                    }],
                }],
            },
        };

        mockedAxios.get.mockResolvedValue({status: 200, data: mockXmlData});
        (parseStringPromise as jest.Mock).mockResolvedValue(mockJsonData);

        const expectedResult: RSSItem[] = [{
            title: 'Example Title',
            link: 'http://example.com',
            description: 'This is an example description.',
            sourceName: 'Example Source',
            sourceUrl: 'http://source.com',
            publishedDate: 'Wed, 01 Jan 2020 00:00:00 GMT'
        }];

        const result = await parser.parse();
        expect(result).toEqual(expectedResult);
    });

    it('should throw an error if response status is not 200', async () => {
        mockedAxios.get.mockResolvedValue({status: 404, statusText: 'Not Found'});

        await expect(parser.parse()).rejects.toThrow('Not Found');
    });

    it('should throw an error if unable to parse XML', async () => {
        mockedAxios.get.mockResolvedValue({status: 200, data: '<invalid><xml>'});
        (parseStringPromise as jest.Mock).mockRejectedValue(new Error('Invalid XML'));

        await expect(parser.parse()).rejects.toThrow('Invalid XML');
    });
});