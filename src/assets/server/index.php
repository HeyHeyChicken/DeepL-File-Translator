<?php
    if (isset($_GET['entity'])) {
        switch ($_GET['entity']) {
            // We upload the file to translate.
            case "upload":
                echo(CallAPI(
                    "POST",
                    getURL($_POST['free']),
                    $_POST['api_key'],
                    array(
                        "file" => $_FILES['file'],
                        "target_lang" => $_POST['target_lang']
                    )
                ));
                break;
            // We ask for the progress of the file translation.
            case "check":
                echo(CallAPI(
                    "POST",
                    getURL($_POST['free']) . "/" . $_POST['document_id'],
                    $_POST['api_key'],
                    array(
                        "document_key" => $_POST['document_key'],
                    )
                ));
                break;
            // We download the translated file.
            case "result":
                echo(CallAPI(
                    "POST",
                    getURL($_POST['free']) . "/" . $_POST['document_id'] . "/result",
                    $_POST['api_key'],
                    array(
                        "document_key" => $_POST['document_key'],
                    ),
                    true
                ));
                break;
        }
    }

    // This function allows you to toggle between the free API URL and the paid URL.
    function getURL($free){
        if(isset($free)){
            if($free == "false"){
                return "https://api.deepl.com/v2/document";
            }
        }
        return "https://api-free.deepl.com/v2/document";
    }

    // This function executes an API call with the provided parameters.
    function CallAPI($method, $url, $apiKey, $data = false, $json = false) {
        $curl = curl_init();
        switch ($method)
        {
            case "POST":
                curl_setopt($curl, CURLOPT_POST, 1);
                if ($data){
                    if(isset($data['file'])){
                        $data['file'] = new CURLFile($data['file']['tmp_name'], get_mime_type($data['file']['name']), $data['file']['name']);
                    }
                    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
                }
                break;
            case "PUT":
                curl_setopt($curl, CURLOPT_PUT, 1);
                break;
            default:
                if ($data)
                    $url = sprintf("%s?%s", $url, http_build_query($data));
        }

        // Authentication:
        $headers = [
            'Authorization: DeepL-Auth-Key ' . $apiKey,
        ];
        if($json){
            array_push($headers, "Content-Type': 'application/json");
        }
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);

        

        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

        $result = curl_exec($curl);

        curl_close($curl);
        $code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        http_response_code($code);

        return $result;
    }

    // This function returns the mime type of a file by its extension.
    function get_mime_type($filename) {
        $idx = explode( '.', $filename );
        $count_explode = count($idx);
        $idx = strtolower($idx[$count_explode-1]);
    
        $mimet = array( 
            'txt' => 'text/plain',
            'htm' => 'text/html',
            'html' => 'text/html',
            'php' => 'text/html',
            'css' => 'text/css',
            'js' => 'application/javascript',
            'json' => 'application/json',
            'xml' => 'application/xml',
            'swf' => 'application/x-shockwave-flash',
            'flv' => 'video/x-flv',
    
            // images
            'png' => 'image/png',
            'jpe' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'jpg' => 'image/jpeg',
            'gif' => 'image/gif',
            'bmp' => 'image/bmp',
            'ico' => 'image/vnd.microsoft.icon',
            'tiff' => 'image/tiff',
            'tif' => 'image/tiff',
            'svg' => 'image/svg+xml',
            'svgz' => 'image/svg+xml',
    
            // archives
            'zip' => 'application/zip',
            'rar' => 'application/x-rar-compressed',
            'exe' => 'application/x-msdownload',
            'msi' => 'application/x-msdownload',
            'cab' => 'application/vnd.ms-cab-compressed',
    
            // audio/video
            'mp3' => 'audio/mpeg',
            'qt' => 'video/quicktime',
            'mov' => 'video/quicktime',
    
            // adobe
            'pdf' => 'application/pdf',
            'psd' => 'image/vnd.adobe.photoshop',
            'ai' => 'application/postscript',
            'eps' => 'application/postscript',
            'ps' => 'application/postscript',
    
            // ms office
            'doc' => 'application/msword',
            'rtf' => 'application/rtf',
            'xls' => 'application/vnd.ms-excel',
            'ppt' => 'application/vnd.ms-powerpoint',
            'docx' => 'application/msword',
            'xlsx' => 'application/vnd.ms-excel',
            'pptx' => 'application/vnd.ms-powerpoint',
    
    
            // open office
            'odt' => 'application/vnd.oasis.opendocument.text',
            'ods' => 'application/vnd.oasis.opendocument.spreadsheet',
        );
    
        if (isset( $mimet[$idx] )) {
         return $mimet[$idx];
        } else {
         return 'application/octet-stream';
        }
     }
?>