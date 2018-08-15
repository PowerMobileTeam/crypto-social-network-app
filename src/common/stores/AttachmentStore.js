import { observable, action, extendObservable } from 'mobx'
import { Platform, Alert } from 'react-native';
import rnFS from 'react-native-fs';
import MediaMeta from 'react-native-media-meta';

import attachmentService from '../services/attachment.service';
import {MINDS_MAX_VIDEO_LENGTH} from '../../config/Config';

/**
 * Attachment Store
 */
export default class AttachmentStore {
  @observable hasAttachment = false;
  @observable uploading = false;
  @observable checkingVideoLength = false;
  @observable progress = 0;

  guid = '';

  @observable uri  = '';
  @observable type = '';
  @observable license = '';
  tempIosVideo = '';

  /**
   * Attach media
   * @param {object} media
   */
  @action
  async attachMedia(media) {

    // no new media acepted if we are checking for video length
    if (this.checkingVideoLength) return;

    // validate media
    const valid = await this.validate(media);
    if (!valid) return;

    if (this.uploading) {
      // abort current upload
     this.cancelCurrentUpload();
    } else if (this.hasAttachment) {
      // delete uploaded media
      attachmentService.deleteMedia(this.guid);
    }

    this.uri  = media.uri;
    this.type = media.type;
    this.setHasAttachment(true);

    const uploadPromise = attachmentService.attachMedia(media, (pct) => {
      this.setProgress(pct);
    });

    // we need to defer the set because a cenceled promise could set it to false
    setTimeout(() => this.setUploading(true), 0);

    this.uploadPromise = uploadPromise;

    try {
      const result = await uploadPromise;
      // ignore canceled
      if (uploadPromise.isCanceled() || !result) return;
      this.guid = result.guid;
    } catch (err) {
      this.clear();
      throw err;
    } finally {
      this.setUploading(false);
    }

    // delete temp ios video if necessary
    if (this.tempIosVideo) {
      rnFS.unlink(this.tempIosVideo);
      this.tempIosVideo = '';
    }

    return this.guid;
  }

  /**
   * Cancel current upload promise and request
   */
  cancelCurrentUpload(clear=true)
  {
    this.uploadPromise && this.uploadPromise.cancel(() => {
      if (clear) this.clear();
    });
  }

  /**
   * Validate media
   * @param {object} media
   */
  @action
  async validate(media) {
    let videoPath = null;
    switch (media.type) {
      case 'video/mp4':
        videoPath = media.path || media.uri.replace(/^.*:\/\//, '');
        break;
      case 'ALAssetTypeVideo':
        // if video is selected from cameraroll we need to copy
        await this.copyVideoIos(media);
        videoPath = this.tempIosVideo;
        media.type = 'video/mp4';
        media.path = videoPath;
        media.uri  = 'file:\/\/'+videoPath;
        break;
    }

    if (videoPath) {
      this.checkingVideoLength = true;
      const meta = await MediaMeta.get(videoPath);

      this.checkingVideoLength = false;

      // check video length
      if (meta.duration && meta.duration > (MINDS_MAX_VIDEO_LENGTH * 60000) ) {
        Alert.alert(
          'Sorry',
          'Video duration must be less than '+MINDS_MAX_VIDEO_LENGTH+' minutes');
        return false;
      }
    }

    return true;
  }

  /**
   * copy a video from ios library assets to temporal app folder
   * @param {object} media
   */
  copyVideoIos(media) {
    this.tempIosVideo = rnFS.TemporaryDirectoryPath+'MINDS-'+Date.now()+'.MP4'
    return rnFS.copyAssetsVideoIOS(media.uri, this.tempIosVideo);
  }

  /**
   * Delete the uploaded attachment
   */
  async delete() {
    if (!this.uploading && this.hasAttachment && this.guid) {
      try {
        attachmentService.deleteMedia(this.guid);
        this.clear();
        return true
      } catch (err) {
        return false;
      }
    } else {
      this.cancelCurrentUpload();
    }
    return true;
  }

  @action
  setProgress(value) {
    this.progress = value
  }

  @action
  setUploading(value) {
    this.uploading = value
  }

  @action
  setHasAttachment(value) {
    this.hasAttachment = value;
  }

  @action
  setLicense(value) {
    this.license = value;
  }

  @action
  clear() {
    this.license = '';
    this.guid = '';
    this.type = '';
    this.uri = '';
    this.hasAttachment = false;
    this.checkingVideoLength = false;
    this.uploading = false;
    this.progress = 0;

    if (this.tempIosVideo) {
      rnFS.unlink(this.tempIosVideo);
      this.tempIosVideo = '';
    }
  }

}