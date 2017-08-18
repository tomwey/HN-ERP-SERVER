require 'net/http'
require 'rest-client'
class WopiController < ApplicationController
  def file_info
    # puts params[:filename]
    filename = "#{params[:filename]}.#{params[:format]}"
    filepath = Rails.root.join('config', filename)
    # puts file
    file = File.read filepath
    sha256 = Digest::SHA256.hexdigest file
    version = Digest::MD5.hexdigest file
    hash = {
      BaseFileName: filename,
      OwnerId:      '893201',
      Size:         file.size,
      # SHA256:       sha256,
      AllowExternalMarketplace: true,
      Version:      version
    }
    
    # puts hash.to_json.to_s
    render json: hash
  end
  
  def download_file
    # render text: params
    filename = "#{params[:filename]}.#{params[:format]}"
    file = Rails.root.join('config', filename)
    send_file(file)
  end
  
  def preview_file
    furl = params[:furl]
    last_path = furl.split('/').last
    format = last_path.split('.').last
    
    url = if format == 'doc' or format == 'docx'
      'http://erp20-mobiledoc.heneng.cn/wv/wordviewerframe.aspx'
    elsif format == 'xls' or format == 'xlsx' 
      'http://erp20-mobiledoc.heneng.cn/x/_layouts/xlviewerinternal.aspx'
    elsif format == 'ppt' or format == 'pptx'
      'http://erp20-mobiledoc.heneng.cn/p/PowerPointFrame.aspx'
    else
      ''
    end
    
    url = url + '?WOPISrc=' + furl
    
    response = RestClient.get url
    
    render text: response.body, format: [:html], layout: false
  end
  
end